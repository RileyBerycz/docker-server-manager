# 🚀 Docker Server Manager

A beautiful, modern web application for managing Docker containers with ease. Spin up web servers, game servers, AI models, databases, and more with just a few clicks!

![Server Manager Dashboard](https://img.shields.io/badge/Docker-Powered-2496ED?style=for-the-badge&logo=docker)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)

## ✨ Features

- 🎨 **Beautiful Modern UI** - Stunning gradient-based design with smooth animations
- 🐳 **Docker Integration** - Full control over Docker containers
- 📊 **Real-time Monitoring** - Live CPU and memory usage stats
- 🎮 **Pre-built Templates** - Quick setup for popular servers:
  - Web servers (Nginx, Apache)
  - Minecraft (Java & Bedrock)
  - AI Models (Ollama)
  - Game servers (Terraria, Valheim)
  - Databases (PostgreSQL, Redis)
  - Custom applications
- ⚙️ **Resource Management** - Configure CPU and memory limits
- 🔌 **Port Mapping** - Easy port configuration
- 📝 **Environment Variables** - Full environment customization
- 📋 **Container Logs** - View logs directly in the UI
- 🔄 **Auto-refresh** - Dashboard updates every 5 seconds

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose
- Node.js 18+ (for development)
- Windows, macOS, or Linux

## 🚀 Quick Start

### 1. Clone or Download

```powershell
cd c:\Projects\Docker-Server-Host
```

### 2. Start the Application

```powershell
docker-compose up -d
```

This will:
- Pull necessary Docker images
- Build the backend and frontend containers
- Start the application on:
  - **Server Manager UI**: http://localhost:3000
  - **Backend API**: http://localhost:3001

### 3. Open Your Browser

Navigate to `http://localhost:3000` and start managing your servers!

## 🎯 Usage Guide

### Creating a Server

1. Click the **"Create Server"** button in the header
2. Choose a template from the grid (or select Custom)
3. Configure your server:
   - Set a unique name
   - Adjust port mappings if needed
   - Add environment variables
   - Set memory and CPU limits
4. Click **"Create Server"**

### Managing Servers

Each server card provides quick actions:
- ▶️ **Start** - Start a stopped server
- ⏹️ **Stop** - Stop a running server
- 🔄 **Restart** - Restart the server
- 📋 **Logs** - View container logs
- 🗑️ **Delete** - Remove the server (with confirmation)

### Server Templates

#### Web Servers
- **Nginx** - Lightweight web server for static sites
- **Apache** - Full-featured HTTP server
- **Node.js** - Run Node.js applications
- **Python** - Host Python web apps

#### Game Servers
- **Minecraft Java** - Latest Java Edition server
- **Minecraft Bedrock** - Bedrock Edition for cross-play
- **Terraria** - Adventure game server
- **Valheim** - Viking survival game server

#### AI & Databases
- **Ollama** - Run local AI models (Llama, Mistral, etc.)
- **PostgreSQL** - Powerful relational database
- **Redis** - In-memory data store

#### Custom
Deploy any Docker image with custom configuration!

## 📁 Project Structure

```
Docker-Server-Host/
├── backend/                # Node.js API
│   ├── src/
│   │   ├── index.js       # Express server
│   │   └── routes/
│   │       ├── servers.js # Container management
│   │       └── templates.js # Server templates
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React UI
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── server-data/          # Persistent data for servers
└── docker-compose.yml    # Docker Compose config
```

## 🛠️ Development

### Running in Development Mode

1. **Backend**:
```powershell
cd backend
npm install
npm run dev
```

2. **Frontend**:
```powershell
cd frontend
npm install
npm start
```

### Environment Variables

Create `.env` files if you need custom configuration:

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
DATA_DIR=/server-data
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3001
```

## 🔧 Configuration

### Resource Limits

Default resource limits can be adjusted in `backend/src/routes/templates.js`:
- Memory is in MB
- CPU cores (1 = 1 full core, 0.5 = half core)

### Port Conflicts

If ports 3000 or 3001 are in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Change frontend port
  - "3003:3001"  # Change backend port
```

## 📊 API Endpoints

The backend provides a REST API:

- `GET /api/servers` - List all servers
- `GET /api/servers/:id` - Get server details
- `POST /api/servers` - Create new server
- `POST /api/servers/:id/start` - Start server
- `POST /api/servers/:id/stop` - Stop server
- `POST /api/servers/:id/restart` - Restart server
- `DELETE /api/servers/:id` - Delete server
- `GET /api/servers/:id/logs` - Get server logs
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template details

## 🌐 Exposing Servers to the Internet

For local development, your servers are accessible on `localhost`. To expose them:

### Option 1: Cloudflare Tunnel (Recommended)

1. Install Cloudflare Tunnel
2. Run: `cloudflared tunnel --url http://localhost:PORT`

### Option 2: ngrok

1. Install ngrok
2. Run: `ngrok http PORT`

### Option 3: Port Forwarding

Configure port forwarding on your router (less secure for production).

## 🎨 Customization

### Changing Theme Colors

Edit `frontend/src/index.css` and modify CSS variables:
```css
:root {
  --accent-primary: #6366f1;  /* Change primary color */
  --accent-secondary: #8b5cf6; /* Change secondary color */
}
```

### Adding New Templates

Edit `backend/src/routes/templates.js` and add to the templates array:
```javascript
{
  id: 'my-server',
  name: 'My Custom Server',
  type: 'custom',
  description: 'Description here',
  icon: '🎯',
  image: 'my-image:latest',
  defaultPorts: [{ host: 8080, container: 80 }],
  environment: [],
  memory: 512,
  cpus: 1,
  color: '#FF5733'
}
```

## 🐛 Troubleshooting

### Docker Socket Permission Denied

**Windows**: Make sure Docker Desktop is running and you have proper permissions.

**Linux**: Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port Already in Use

Check which process is using the port:
```powershell
netstat -ano | findstr :3000
```

Stop the process or change the port in `docker-compose.yml`.

### Containers Not Starting

Check logs:
```powershell
docker-compose logs -f
```

Or check individual container logs in the UI.

## 🔄 Updates & Maintenance

### Updating the Application

```powershell
# Pull latest changes
git pull

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Cleaning Up

Remove unused Docker resources:
```powershell
# Remove stopped containers
docker-compose down

# Clean up unused images and volumes
docker system prune -a --volumes
```

## 📝 Data Persistence

Server data is stored in `./server-data/` directory, organized by server type:
- `nginx/` - Nginx web files
- `minecraft/` - Minecraft worlds
- `ollama/` - AI models
- etc.

This data persists across container restarts and updates.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎉 Tips & Tricks

1. **Minecraft Setup**: After creating a Minecraft server, wait 1-2 minutes for it to generate the world
2. **Ollama AI**: After starting Ollama, exec into the container to pull models:
   ```powershell
   docker exec -it <container-name> ollama pull llama2
   ```
3. **Web Servers**: Place your HTML files in `server-data/nginx/` for Nginx servers
4. **Resource Monitoring**: Watch the dashboard for real-time CPU and memory usage
5. **Backup**: Regularly backup your `server-data/` directory

## 🌟 Future Features

- [ ] Container shell access
- [ ] Backup and restore functionality
- [ ] Server groups and categories
- [ ] Multi-host support
- [ ] Authentication and user management
- [ ] Cloudflare Tunnel integration
- [ ] Docker Compose file import
- [ ] Network management
- [ ] Volume management

---

Made with ❤️ for easy Docker management

🚀 **Happy Server Hosting!**
