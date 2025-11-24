const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const { body, validationResult } = require('express-validator');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Get all managed servers (containers)
router.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    // Filter containers that are managed by this app (have specific label)
    const managedContainers = containers.filter(c => 
      c.Labels && c.Labels['managed-by'] === 'server-manager'
    );
    
    const serversInfo = await Promise.all(
      managedContainers.map(async (container) => {
        const containerObj = docker.getContainer(container.Id);
        const stats = container.State === 'running' ? await getContainerStats(containerObj) : null;
        
        return {
          id: container.Id,
          name: container.Names[0].replace('/', ''),
          type: container.Labels['server-type'] || 'custom',
          status: container.State,
          created: container.Created,
          ports: container.Ports,
          image: container.Image,
          stats: stats,
          labels: container.Labels
        };
      })
    );
    
    res.json({ servers: serversInfo });
  } catch (error) {
    console.error('Error listing servers:', error);
    res.status(500).json({ error: 'Failed to list servers' });
  }
});

// Get single server details
router.get('/:id', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const info = await container.inspect();
    const stats = info.State.Running ? await getContainerStats(container) : null;
    
    res.json({
      id: info.Id,
      name: info.Name.replace('/', ''),
      type: info.Config.Labels['server-type'] || 'custom',
      status: info.State.Status,
      created: info.Created,
      image: info.Config.Image,
      ports: info.NetworkSettings.Ports,
      stats: stats,
      config: {
        env: info.Config.Env,
        cmd: info.Config.Cmd,
        memory: info.HostConfig.Memory,
        cpus: info.HostConfig.NanoCpus / 1000000000
      }
    });
  } catch (error) {
    console.error('Error getting server details:', error);
    res.status(500).json({ error: 'Failed to get server details' });
  }
});

// Create new server
router.post('/', [
  body('name').notEmpty().trim(),
  body('type').notEmpty(),
  body('image').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, type, image, ports, environment, volumes, memory, cpus } = req.body;
    
    // Sanitize container name (Docker only allows [a-zA-Z0-9][a-zA-Z0-9_.-])
    const sanitizedName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '-')
      .replace(/^[^a-z0-9]+/, '') // Remove leading non-alphanumeric
      .replace(/-+/g, '-')        // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '');     // Remove leading/trailing dashes
    
    if (!sanitizedName) {
      return res.status(400).json({ error: 'Invalid server name. Please use letters and numbers.' });
    }
    
    // Pull image if not exists
    await pullImageIfNeeded(image);
    
    // Prepare port bindings
    const portBindings = {};
    const exposedPorts = {};
    if (ports && Array.isArray(ports)) {
      ports.forEach(port => {
        const containerPort = `${port.container}/tcp`;
        exposedPorts[containerPort] = {};
        portBindings[containerPort] = [{ HostPort: String(port.host) }];
      });
    }
    
    // Create container
    const container = await docker.createContainer({
      name: sanitizedName,
      Image: image,
      Env: environment || [],
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        Binds: volumes || [],
        Memory: memory ? memory * 1024 * 1024 : 0, // Convert MB to bytes
        NanoCpus: cpus ? cpus * 1000000000 : 0,
        RestartPolicy: { Name: 'unless-stopped' }
      },
      Labels: {
        'managed-by': 'server-manager',
        'server-type': type,
        'created-at': new Date().toISOString()
      }
    });
    
    await container.start();
    
    res.status(201).json({
      message: 'Server created successfully',
      id: container.id
    });
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({ error: error.message || 'Failed to create server' });
  }
});

// Start server
router.post('/:id/start', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ message: 'Server started successfully' });
  } catch (error) {
    console.error('Error starting server:', error);
    res.status(500).json({ error: 'Failed to start server' });
  }
});

// Stop server
router.post('/:id/stop', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ message: 'Server stopped successfully' });
  } catch (error) {
    console.error('Error stopping server:', error);
    res.status(500).json({ error: 'Failed to stop server' });
  }
});

// Restart server
router.post('/:id/restart', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.json({ message: 'Server restarted successfully' });
  } catch (error) {
    console.error('Error restarting server:', error);
    res.status(500).json({ error: 'Failed to restart server' });
  }
});

// Delete server
router.delete('/:id', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const info = await container.inspect();
    
    // Stop if running
    if (info.State.Running) {
      await container.stop();
    }
    
    await container.remove({ force: true });
    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

// Get server logs
router.get('/:id/logs', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });
    
    res.json({ logs: logs.toString('utf8') });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get server logs' });
  }
});

// Helper functions
async function getContainerStats(container) {
  try {
    const stats = await container.stats({ stream: false });
    
    // Calculate CPU percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 0;
    const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;
    
    return {
      cpu: cpuPercent.toFixed(2),
      memory: {
        usage: (memoryUsage / 1024 / 1024).toFixed(2), // MB
        limit: (memoryLimit / 1024 / 1024).toFixed(2), // MB
        percent: memoryPercent.toFixed(2)
      }
    };
  } catch (error) {
    return null;
  }
}

async function pullImageIfNeeded(image) {
  try {
    await docker.getImage(image).inspect();
  } catch (error) {
    // Image doesn't exist, pull it
    console.log(`Pulling image: ${image}`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });
  }
}

module.exports = router;
