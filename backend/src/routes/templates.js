const express = require('express');
const router = express.Router();

// Server templates for easy deployment
const templates = [
  {
    id: 'nginx-web',
    name: 'Web Server (Nginx)',
    type: 'web',
    description: 'Host static websites or use as a reverse proxy',
    icon: '🌐',
    image: 'nginx:alpine',
    defaultPorts: [{ host: 8080, container: 80 }],
    environment: [],
    volumes: ['/server-data/nginx:/usr/share/nginx/html:ro'],
    memory: 512,
    cpus: 1,
    color: '#009639'
  },
  {
    id: 'apache-web',
    name: 'Web Server (Apache)',
    type: 'web',
    description: 'Apache HTTP Server for dynamic web applications',
    icon: '🪶',
    image: 'httpd:alpine',
    defaultPorts: [{ host: 8081, container: 80 }],
    environment: [],
    volumes: ['/server-data/apache:/usr/local/apache2/htdocs/'],
    memory: 512,
    cpus: 1,
    color: '#D22128'
  },
  {
    id: 'minecraft-java',
    name: 'Minecraft Java Server',
    type: 'game',
    description: 'Minecraft Java Edition server',
    icon: '⛏️',
    image: 'itzg/minecraft-server',
    defaultPorts: [{ host: 25565, container: 25565 }],
    environment: [
      'EULA=TRUE',
      'VERSION=LATEST',
      'MEMORY=2G',
      'DIFFICULTY=normal',
      'MAX_PLAYERS=20',
      'MOTD=My Minecraft Server'
    ],
    volumes: ['/server-data/minecraft:/data'],
    memory: 2048,
    cpus: 2,
    color: '#62B47A'
  },
  {
    id: 'minecraft-bedrock',
    name: 'Minecraft Bedrock Server',
    type: 'game',
    description: 'Minecraft Bedrock Edition server',
    icon: '🎮',
    image: 'itzg/minecraft-bedrock-server',
    defaultPorts: [{ host: 19132, container: 19132 }],
    environment: [
      'EULA=TRUE',
      'VERSION=LATEST',
      'DIFFICULTY=normal',
      'MAX_PLAYERS=20',
      'SERVER_NAME=My Bedrock Server'
    ],
    volumes: ['/server-data/minecraft-bedrock:/data'],
    memory: 1024,
    cpus: 2,
    color: '#1E90FF'
  },
  {
    id: 'ollama',
    name: 'Ollama AI Server',
    type: 'ai',
    description: 'Run local AI models with Ollama',
    icon: '🤖',
    image: 'ollama/ollama',
    defaultPorts: [{ host: 11434, container: 11434 }],
    environment: [],
    volumes: ['/server-data/ollama:/root/.ollama'],
    memory: 4096,
    cpus: 4,
    color: '#000000',
    notes: 'After starting, run: docker exec -it <container_name> ollama pull llama2'
  },
  {
    id: 'terraria',
    name: 'Terraria Server',
    type: 'game',
    description: 'Terraria dedicated server',
    icon: '🌍',
    image: 'ryshe/terraria',
    defaultPorts: [{ host: 7777, container: 7777 }],
    environment: [
      'WORLD=MyWorld',
      'DIFFICULTY=1'
    ],
    volumes: ['/server-data/terraria:/config'],
    memory: 1024,
    cpus: 2,
    color: '#5C9A4A'
  },
  {
    id: 'valheim',
    name: 'Valheim Server',
    type: 'game',
    description: 'Valheim dedicated server',
    icon: '⚔️',
    image: 'lloesche/valheim-server',
    defaultPorts: [
      { host: 2456, container: 2456 },
      { host: 2457, container: 2457 }
    ],
    environment: [
      'SERVER_NAME=My Valheim Server',
      'WORLD_NAME=MyWorld',
      'SERVER_PASS=secret123'
    ],
    volumes: ['/server-data/valheim:/config'],
    memory: 2048,
    cpus: 2,
    color: '#7C4A3A'
  },
  {
    id: 'node-app',
    name: 'Node.js Application',
    type: 'web',
    description: 'Host Node.js/Express applications',
    icon: '📦',
    image: 'node:18-alpine',
    defaultPorts: [{ host: 3000, container: 3000 }],
    environment: ['NODE_ENV=production'],
    volumes: ['/server-data/node-app:/app'],
    memory: 512,
    cpus: 1,
    color: '#68A063'
  },
  {
    id: 'python-app',
    name: 'Python Application',
    type: 'web',
    description: 'Host Python/Flask/Django applications',
    icon: '🐍',
    image: 'python:3.11-slim',
    defaultPorts: [{ host: 5000, container: 5000 }],
    environment: [],
    volumes: ['/server-data/python-app:/app'],
    memory: 512,
    cpus: 1,
    color: '#3776AB'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    type: 'database',
    description: 'PostgreSQL database server',
    icon: '🐘',
    image: 'postgres:15-alpine',
    defaultPorts: [{ host: 5432, container: 5432 }],
    environment: [
      'POSTGRES_USER=admin',
      'POSTGRES_PASSWORD=changeme',
      'POSTGRES_DB=mydb'
    ],
    volumes: ['/server-data/postgres:/var/lib/postgresql/data'],
    memory: 512,
    cpus: 1,
    color: '#336791'
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    type: 'database',
    description: 'Redis in-memory data store',
    icon: '⚡',
    image: 'redis:alpine',
    defaultPorts: [{ host: 6379, container: 6379 }],
    environment: [],
    volumes: ['/server-data/redis:/data'],
    memory: 256,
    cpus: 1,
    color: '#DC382D'
  },
  {
    id: 'custom',
    name: 'Custom Server',
    type: 'custom',
    description: 'Deploy any Docker image',
    icon: '🔧',
    image: '',
    defaultPorts: [],
    environment: [],
    volumes: [],
    memory: 512,
    cpus: 1,
    color: '#6B7280'
  }
];

// Get all templates
router.get('/', (req, res) => {
  const { type } = req.query;
  
  let filteredTemplates = templates;
  if (type) {
    filteredTemplates = templates.filter(t => t.type === type);
  }
  
  res.json({ templates: filteredTemplates });
});

// Get single template
router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

module.exports = router;
