import React from 'react';
import { FiServer, FiPlus, FiFilter } from 'react-icons/fi';
import './Header.css';

const Header = ({ onCreateServer, filterType, onFilterChange }) => {
  const filters = [
    { value: 'all', label: 'All Servers' },
    { value: 'web', label: 'Web' },
    { value: 'game', label: 'Game' },
    { value: 'ai', label: 'AI' },
    { value: 'database', label: 'Database' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <FiServer className="logo-icon" />
            <h1 className="logo-text">Server Manager</h1>
          </div>
          <p className="subtitle">Manage your Docker servers with ease</p>
        </div>

        <div className="header-right">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select 
              className="filter-select"
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              {filters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <button className="create-btn" onClick={onCreateServer}>
            <FiPlus className="btn-icon" />
            <span>Create Server</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
