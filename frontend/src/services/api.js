import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

// Server operations
export const getServers = async () => {
  const response = await api.get('/servers');
  return response.data;
};

export const getServer = async (id) => {
  const response = await api.get(`/servers/${id}`);
  return response.data;
};

export const createServer = async (serverData) => {
  const response = await api.post('/servers', serverData);
  return response.data;
};

export const startServer = async (id) => {
  const response = await api.post(`/servers/${id}/start`);
  return response.data;
};

export const stopServer = async (id) => {
  const response = await api.post(`/servers/${id}/stop`);
  return response.data;
};

export const restartServer = async (id) => {
  const response = await api.post(`/servers/${id}/restart`);
  return response.data;
};

export const deleteServer = async (id) => {
  const response = await api.delete(`/servers/${id}`);
  return response.data;
};

export const getServerLogs = async (id) => {
  const response = await api.get(`/servers/${id}/logs`);
  return response.data;
};

// Template operations
export const getTemplates = async (type) => {
  const params = type ? { type } : {};
  const response = await api.get('/templates', { params });
  return response.data;
};

export const getTemplate = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

export default api;
