import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Search, FileText, TrendingUp, Clock, Tag, FileType, BarChart3, PieChart, Activity, HardDrive } from 'lucide-react';
import { CategoryChart, FileTypeChart, ActivityChart, StorageChart } from '../components/Charts';
import api from '../services/api';
import './Home.css';

function Home({ stats }) {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    loadDetailedInfo();
  }, []);

  const loadDetailedInfo = async () => {
    try {
      const data = await api.getStats();
      setRecentDocs(data.recentDocuments || []);
      setCategories(data.topCategories || []);
      setExtensions(data.fileTypes || []);
    } catch (error) {
      console.error('Failed to load detailed info:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Marketing Knowledge Library</h1>
          <p className="hero-subtitle">A curated collection of marketing documents, campaigns, and resources</p>
          <button className="cta-button" onClick={() => navigate('/documents')}>
            <Search size={20} />
            Explore Collection
          </button>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">{stats?.totalDocuments || 0}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">{stats?.totalCategories || 0}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">{stats?.totalProjects || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <Activity size={24} />
            <h3>Recent Activity (Last 7 Days)</h3>
          </div>
          <div className="chart-content">
            <ActivityChart data={recentDocs} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <BarChart3 size={24} />
            <h3>Category Distribution</h3>
          </div>
          <div className="chart-content">
            <CategoryChart data={categories} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <PieChart size={24} />
            <h3>File Type Breakdown</h3>
          </div>
          <div className="chart-content">
            <FileTypeChart data={extensions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <HardDrive size={24} />
            <h3>Storage Usage by Type</h3>
          </div>
          <div className="chart-content">
            <StorageChart data={extensions} />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <Book size={32} />
          </div>
          <h3>Comprehensive Archive</h3>
          <p>Access {stats?.totalDocuments || 0} carefully indexed documents spanning all marketing disciplines</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FileText size={32} />
          </div>
          <h3>Smart Categorization</h3>
          <p>Documents automatically organized into {stats?.totalCategories || 0} distinct categories for easy discovery</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <TrendingUp size={32} />
          </div>
          <h3>Instant Search</h3>
          <p>Find what you need in seconds with our powerful full-text search engine</p>
        </div>
      </section>


      <section className="details-grid">
        <div className="detail-card">
          <div className="detail-header">
            <Clock size={24} />
            <h3>Recent Additions</h3>
          </div>
          <div className="detail-content">
            {recentDocs.length > 0 ? (
              <ul className="recent-docs-list">
                {recentDocs.map((doc, idx) => (
                  <li key={idx} className="recent-doc-item">
                    <div className="doc-info">
                      <span className="doc-name">{doc.filename}</span>
                      <span className="doc-date">{formatDate(doc.modified)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No recent documents</p>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <Tag size={24} />
            <h3>Top Categories</h3>
          </div>
          <div className="detail-content">
            {categories.length > 0 ? (
              <ul className="category-list">
                {categories.map((cat, idx) => (
                  <li key={idx} className="category-item">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat.count} docs</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No categories yet</p>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <FileType size={24} />
            <h3>File Types</h3>
          </div>
          <div className="detail-content">
            {extensions.length > 0 ? (
              <ul className="filetype-list">
                {extensions.map((ext, idx) => (
                  <li key={idx} className="filetype-item">
                    <span className="filetype-name">.{ext.extension}</span>
                    <div className="filetype-info">
                      <span className="filetype-count">{ext.count} files</span>
                      <span className="filetype-size">{formatFileSize(ext.totalSize)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No files yet</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
