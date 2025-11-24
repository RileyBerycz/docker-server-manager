import React, { useState } from 'react';
import { FiPlay, FiSquare, FiRefreshCw, FiTrash2, FiTerminal, FiCpu, FiActivity } from 'react-icons/fi';
import { startServer, stopServer, restartServer, deleteServer, getServerLogs } from '../services/api';
import './ServerCard.css';

const ServerCard = ({ server, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState('');

  const handleAction = async (action, id) => {
    setLoading(true);
    try {
      await action(id);
      setTimeout(onUpdate, 1000); // Refresh after action
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async () => {
    try {
      const response = await getServerLogs(server.id);
      setLogs(response.logs);
      setShowLogs(true);
    } catch (error) {
      console.error('Failed to get logs:', error);
      alert('Failed to get logs');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${server.name}"?`)) {
      await handleAction(deleteServer, server.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'exited': return '#ef4444';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      web: '🌐',
      game: '🎮',
      ai: '🤖',
      database: '🗄️',
      custom: '🔧'
    };
    return icons[type] || '📦';
  };

  return (
    <>
      <div className="server-card" style={{ borderTopColor: getStatusColor(server.status) }}>
        <div className="card-header">
          <div className="server-info">
            <span className="server-icon">{getTypeIcon(server.type)}</span>
            <div>
              <h3 className="server-name">{server.name}</h3>
              <span className="server-type">{server.type}</span>
            </div>
          </div>
          <div className="status-badge" style={{ backgroundColor: getStatusColor(server.status) }}>
            {server.status}
          </div>
        </div>

        {server.stats && (
          <div className="stats-section">
            <div className="stat-item">
              <FiCpu className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">CPU</span>
                <span className="stat-value">{server.stats.cpu}%</span>
              </div>
            </div>
            <div className="stat-item">
              <FiActivity className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Memory</span>
                <span className="stat-value">{server.stats.memory.usage} MB</span>
              </div>
            </div>
          </div>
        )}

        {server.ports && server.ports.length > 0 && (
          <div className="ports-section">
            <span className="ports-label">Ports:</span>
            <div className="ports-list">
              {server.ports.map((port, idx) => (
                <span key={idx} className="port-badge">
                  {port.PublicPort ? `${port.PublicPort}→${port.PrivatePort}` : port.PrivatePort}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card-actions">
          {server.status === 'running' ? (
            <button 
              className="action-btn stop-btn"
              onClick={() => handleAction(stopServer, server.id)}
              disabled={loading}
            >
              <FiSquare /> Stop
            </button>
          ) : (
            <button 
              className="action-btn start-btn"
              onClick={() => handleAction(startServer, server.id)}
              disabled={loading}
            >
              <FiPlay /> Start
            </button>
          )}
          
          <button 
            className="action-btn restart-btn"
            onClick={() => handleAction(restartServer, server.id)}
            disabled={loading}
          >
            <FiRefreshCw /> Restart
          </button>

          <button 
            className="action-btn logs-btn"
            onClick={handleViewLogs}
            disabled={loading}
          >
            <FiTerminal /> Logs
          </button>

          <button 
            className="action-btn delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            <FiTrash2 /> Delete
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>

      {showLogs && (
        <div className="modal-overlay" onClick={() => setShowLogs(false)}>
          <div className="logs-modal" onClick={e => e.stopPropagation()}>
            <div className="logs-header">
              <h3>Logs: {server.name}</h3>
              <button className="close-btn" onClick={() => setShowLogs(false)}>✕</button>
            </div>
            <pre className="logs-content">{logs || 'No logs available'}</pre>
          </div>
        </div>
      )}
    </>
  );
};

export default ServerCard;
