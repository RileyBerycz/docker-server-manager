const express = require('express');
const cors = require('cors');
require('dotenv').config();

const serverRoutes = require('./routes/servers');
const templatesRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/servers', serverRoutes);
app.use('/api/templates', templatesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server Manager API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Manager Backend running on port ${PORT}`);
});
