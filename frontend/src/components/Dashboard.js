import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ServerCard from './ServerCard';
import './Dashboard.css';

const Dashboard = ({ servers, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="stats">
          <div className="stat-card">
            <h3>{servers.length}</h3>
            <p>Total Servers</p>
          </div>
          <div className="stat-card">
            <h3>{servers.filter(s => s.status === 'running').length}</h3>
            <p>Running</p>
          </div>
          <div className="stat-card">
            <h3>{servers.filter(s => s.status !== 'running').length}</h3>
            <p>Stopped</p>
          </div>
        </div>

        <button className="refresh-btn" onClick={onRefresh}>
          <FiRefreshCw className="refresh-icon" />
          Refresh
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <h2>No servers yet</h2>
          <p>Create your first server to get started!</p>
        </div>
      ) : (
        <div className="servers-grid">
          {servers.map(server => (
            <ServerCard key={server.id} server={server} onUpdate={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
