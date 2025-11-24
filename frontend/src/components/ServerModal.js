import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { createServer } from '../services/api';
import './ServerModal.css';

const ServerModal = ({ templates, onClose, onServerCreated }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    ports: [],
    environment: [],
    volumes: [],
    memory: 512,
    cpus: 1
  });
  const [loading, setLoading] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: '',
      image: template.image,
      ports: [...template.defaultPorts],
      environment: [...template.environment],
      volumes: [...template.volumes],
      memory: template.memory || 512,
      cpus: template.cpus || 1
    });
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePortChange = (index, field, value) => {
    const newPorts = [...formData.ports];
    newPorts[index] = { ...newPorts[index], [field]: parseInt(value) || 0 };
    setFormData(prev => ({ ...prev, ports: newPorts }));
  };

  const addPort = () => {
    setFormData(prev => ({
      ...prev,
      ports: [...prev.ports, { host: 8000, container: 8000 }]
    }));
  };

  const removePort = (index) => {
    setFormData(prev => ({
      ...prev,
      ports: prev.ports.filter((_, i) => i !== index)
    }));
  };

  const handleEnvChange = (index, value) => {
    const newEnv = [...formData.environment];
    newEnv[index] = value;
    setFormData(prev => ({ ...prev, environment: newEnv }));
  };

  const addEnv = () => {
    setFormData(prev => ({
      ...prev,
      environment: [...prev.environment, 'KEY=value']
    }));
  };

  const removeEnv = (index) => {
    setFormData(prev => ({
      ...prev,
      environment: prev.environment.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a server name');
      return;
    }

    setLoading(true);
    try {
      await createServer({
        name: formData.name,
        type: selectedTemplate.type,
        image: formData.image,
        ports: formData.ports,
        environment: formData.environment,
        volumes: formData.volumes,
        memory: formData.memory,
        cpus: formData.cpus
      });
      onServerCreated();
    } catch (error) {
      console.error('Failed to create server:', error);
      alert('Failed to create server: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="server-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 1 ? 'Choose a Template' : 'Configure Server'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {step === 1 ? (
          <div className="templates-grid">
            {templates.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
                style={{ borderLeftColor: template.color }}
              >
                <div className="template-icon">{template.icon}</div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                {template.notes && (
                  <div className="template-note">💡 {template.notes}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <form className="config-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <label className="form-label">Server Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="my-awesome-server"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label">Docker Image</label>
              <input
                type="text"
                className="form-input"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="nginx:alpine"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label">Port Mappings</label>
              {formData.ports.map((port, index) => (
                <div key={index} className="port-mapping">
                  <input
                    type="number"
                    className="form-input-small"
                    value={port.host}
                    onChange={(e) => handlePortChange(index, 'host', e.target.value)}
                    placeholder="Host"
                  />
                  <span>→</span>
                  <input
                    type="number"
                    className="form-input-small"
                    value={port.container}
                    onChange={(e) => handlePortChange(index, 'container', e.target.value)}
                    placeholder="Container"
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removePort(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addPort}>
                + Add Port
              </button>
            </div>

            <div className="form-section">
              <label className="form-label">Environment Variables</label>
              {formData.environment.map((env, index) => (
                <div key={index} className="env-variable">
                  <input
                    type="text"
                    className="form-input"
                    value={env}
                    onChange={(e) => handleEnvChange(index, e.target.value)}
                    placeholder="KEY=value"
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeEnv(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addEnv}>
                + Add Variable
              </button>
            </div>

            <div className="form-row">
              <div className="form-section">
                <label className="form-label">Memory (MB)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.memory}
                  onChange={(e) => handleInputChange('memory', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-section">
                <label className="form-label">CPUs</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.cpus}
                  onChange={(e) => handleInputChange('cpus', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Server'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServerModal;
