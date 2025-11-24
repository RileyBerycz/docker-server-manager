import axios from 'axios';

// Dynamically determine API URL based on current host
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Use the same host as the frontend, but with backend port
  const currentHost = window.location.hostname;
  return `http://${currentHost}:3001`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

// Add error interceptor for better debugging
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may be slow or unreachable');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - cannot reach backend at:', API_URL);
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
    return Promise.reject(error);
  }
);

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
