import React from 'react';
import { FileText, Download, ExternalLink, Calendar, Tag, Users, Folder } from 'lucide-react';
import './SearchResults.css';

function SearchResults({ results, loading, query }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (extension) => {
    return <FileText size={24} />;
  };

  const getFileTypeColor = (extension) => {
    const colors = {
      '.pdf': '#e74c3c',
      '.docx': '#3498db',
      '.doc': '#3498db',
      '.txt': '#95a5a6',
      '.md': '#34495e',
      '.html': '#e67e22',
      '.pptx': '#d35400'
    };
    return colors[extension] || '#7f8c8d';
  };

  if (loading) {
    return (
      <div className="search-results">
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching documents...</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="search-results">
        <div className="no-results">
          <FileText size={48} />
          <h3>No documents found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Search Results</h2>
        <span className="results-count">{results.length} documents found</span>
      </div>

      <div className="results-list">
        {results.map((doc) => (
          <div key={doc.id} className="result-card">
            <div className="result-header">
              <div className="file-info">
                <div 
                  className="file-icon" 
                  style={{ color: getFileTypeColor(doc.extension) }}
                >
                  {getFileIcon(doc.extension)}
                </div>
                <div className="file-details">
                  <h3 className="file-name">{doc.filename}</h3>
                  <p className="file-path">{doc.path}</p>
                </div>
              </div>
              <div className="result-actions">
                <a 
                  href={`http://localhost:5000${doc.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn view-btn"
                  title="Open file"
                >
                  <ExternalLink size={18} />
                </a>
                <a 
                  href={`http://localhost:5000${doc.url}`}
                  download
                  className="action-btn download-btn"
                  title="Download file"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>

            <p className="file-preview">{doc.preview}</p>

            <div className="result-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>{formatDate(doc.modified)}</span>
              </div>
              <div className="meta-item">
                <FileText size={14} />
                <span>{formatFileSize(doc.size)}</span>
              </div>
              {doc.team && (
                <div className="meta-item">
                  <Users size={14} />
                  <span>{doc.team}</span>
                </div>
              )}
              {doc.project && (
                <div className="meta-item">
                  <Folder size={14} />
                  <span>{doc.project}</span>
                </div>
              )}
            </div>

            {doc.categories && doc.categories.length > 0 && (
              <div className="result-tags">
                {doc.categories.map((category, index) => (
                  <span key={index} className="tag">
                    <Tag size={12} />
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
