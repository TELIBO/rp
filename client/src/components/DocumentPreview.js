import React from 'react';
import { X, Download, ExternalLink, FileText, Calendar, Users, Tag, Folder } from 'lucide-react';
import './DocumentPreview.css';

function DocumentPreview({ document, onClose }) {
  if (!document) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const canPreviewInline = (extension) => {
    return ['.txt', '.md', '.html'].includes(extension);
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title-section">
            <FileText size={24} style={{ color: getFileTypeColor(document.extension) }} />
            <div>
              <h2 className="preview-title">{document.filename}</h2>
              <p className="preview-path">{document.path}</p>
            </div>
          </div>
          <div className="preview-actions">
            <a
              href={`http://localhost:5000${document.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-action-btn"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <a
              href={`http://localhost:5000${document.url}`}
              download
              className="preview-action-btn"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button className="preview-close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="preview-metadata">
          <div className="metadata-item">
            <Calendar size={16} />
            <span>Modified: {formatDate(document.modified)}</span>
          </div>
          <div className="metadata-item">
            <FileText size={16} />
            <span>{formatFileSize(document.size)}</span>
          </div>
          {document.team && (
            <div className="metadata-item">
              <Users size={16} />
              <span>{document.team}</span>
            </div>
          )}
          {document.project && (
            <div className="metadata-item">
              <Folder size={16} />
              <span>{document.project}</span>
            </div>
          )}
        </div>

        {document.categories && document.categories.length > 0 && (
          <div className="preview-categories">
            {document.categories.map((category, index) => (
              <span key={index} className="preview-tag">
                <Tag size={12} />
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="preview-content">
          {canPreviewInline(document.extension) ? (
            <div className="preview-text">
              <h3>Preview</h3>
              <div className="preview-text-content">
                {document.content || document.preview || 'No content available'}
              </div>
            </div>
          ) : document.extension === '.pdf' ? (
            <div className="preview-iframe-container">
              <iframe
                src={`http://localhost:5000${document.url}`}
                title={document.filename}
                className="preview-iframe"
              />
            </div>
          ) : (
            <div className="preview-placeholder">
              <FileText size={64} style={{ color: getFileTypeColor(document.extension), opacity: 0.3 }} />
              <h3>Preview Not Available</h3>
              <p>This file type cannot be previewed inline.</p>
              <p className="preview-hint">Click "Open in new tab" or "Download" to view the file.</p>
            </div>
          )}
        </div>

        {/* {document.preview && (
          <div className="preview-summary">
            <h3>Summary</h3>
            <p>{document.preview}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default DocumentPreview;
