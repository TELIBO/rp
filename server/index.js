const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const DocumentIndexer = require('./services/documentIndexer');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const documentRoutes = require('./routes/documents');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Initialize document indexer
const documentsPath = process.env.DOCUMENTS_PATH 
  ? path.join(__dirname, '..', process.env.DOCUMENTS_PATH.replace('./', ''))
  : path.join(__dirname, '../documents-demo');
const indexPath = process.env.INDEX_PATH
  ? path.join(__dirname, '..', process.env.INDEX_PATH.replace('./', ''))
  : path.join(__dirname, '../index');

console.log('Documents path:', documentsPath);
console.log('Index path:', indexPath);

const documentIndexer = new DocumentIndexer(documentsPath, indexPath);

// Make indexer available to routes
app.set('documentIndexer', documentIndexer);

// Serve static files (documents) -- after documentsPath is defined
app.use('/files', express.static(documentsPath));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Search API is running' });
});

// Initialize directories and start indexing
async function initialize() {
  try {
    console.log('=== Starting Server Initialization ===');
    console.log('Node version:', process.version);
    console.log('Working directory:', process.cwd());
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Create necessary directories
    console.log('Creating directories...');
    await fs.mkdir(documentsPath, { recursive: true });
    await fs.mkdir(indexPath, { recursive: true });
    await fs.mkdir(path.join(__dirname, '../uploads'), { recursive: true });
    console.log('Directories created successfully');

    // Start indexing
    console.log('Starting document indexing...');
    await documentIndexer.initialize();
    console.log('Document indexing completed');

    // Start file watching (only in development)
    if (process.env.NODE_ENV !== 'production') {
      documentIndexer.watchFiles();
      console.log('File watching enabled');
    }

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Initialization error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

initialize();

module.exports = app;
