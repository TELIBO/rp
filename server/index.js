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

// Serve static files (documents)
app.use('/files', express.static(path.join(__dirname, '../documents')));

// Initialize document indexer
const documentsPath = path.join(__dirname, '../documents');
const indexPath = path.join(__dirname, '../index');
const documentIndexer = new DocumentIndexer(documentsPath, indexPath);

// Make indexer available to routes
app.set('documentIndexer', documentIndexer);

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
    // Create necessary directories
    await fs.mkdir(documentsPath, { recursive: true });
    await fs.mkdir(indexPath, { recursive: true });
    await fs.mkdir(path.join(__dirname, '../uploads'), { recursive: true });

    // Start indexing
    console.log('Starting document indexing...');
    await documentIndexer.initialize();
    console.log('Document indexing completed');

    // Start file watching
    documentIndexer.watchFiles();
    console.log('File watching enabled');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

initialize();

module.exports = app;
