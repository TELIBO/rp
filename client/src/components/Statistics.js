import React from 'react';
import { FileText, Folder, Users, Tag } from 'lucide-react';
import './Statistics.css';

function Statistics({ stats }) {
  return (
    <div className="statistics">
      <h2>Document Library Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3498db20', color: '#3498db' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalDocuments}</div>
            <div className="stat-label">Total Documents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e74c3c20', color: '#e74c3c' }}>
            <Tag size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.categories.categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2ecc7120', color: '#2ecc71' }}>
            <Folder size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.categories.projects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f39c1220', color: '#f39c12' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.categories.teams.length}</div>
            <div className="stat-label">Teams</div>
          </div>
        </div>
      </div>

      <div className="quick-info">
        <div className="info-section">
          <h3>Top Categories</h3>
          <div className="info-list">
            {stats.categories.categories.slice(0, 5).map((cat, index) => (
              <div key={index} className="info-item">
                <span className="bullet">•</span>
                {cat}
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h3>Active Projects</h3>
          <div className="info-list">
            {stats.categories.projects.slice(0, 5).map((proj, index) => (
              <div key={index} className="info-item">
                <span className="bullet">•</span>
                {proj}
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h3>Teams</h3>
          <div className="info-list">
            {stats.categories.teams.slice(0, 5).map((team, index) => (
              <div key={index} className="info-item">
                <span className="bullet">•</span>
                {team}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
