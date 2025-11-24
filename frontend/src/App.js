import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import ServerModal from './components/ServerModal';
import Header from './components/Header';
import { getServers, getTemplates } from './services/api';

function App() {
  const [servers, setServers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [serversData, templatesData] = await Promise.all([
        getServers(),
        getTemplates()
      ]);
      setServers(serversData.servers || []);
      setTemplates(templatesData.templates || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerCreated = () => {
    setShowModal(false);
    loadData();
  };

  const filteredServers = filterType === 'all' 
    ? servers 
    : servers.filter(s => s.type === filterType);

  return (
    <div className="App">
      <Header 
        onCreateServer={() => setShowModal(true)}
        filterType={filterType}
        onFilterChange={setFilterType}
      />
      
      <Dashboard 
        servers={filteredServers}
        loading={loading}
        onRefresh={loadData}
      />

      {showModal && (
        <ServerModal
          templates={templates}
          onClose={() => setShowModal(false)}
          onServerCreated={handleServerCreated}
        />
      )}
    </div>
  );
}

export default App;
