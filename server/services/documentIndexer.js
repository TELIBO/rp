const fs = require('fs').promises;
const path = require('path');
const lunr = require('lunr');
const chokidar = require('chokidar');
const DocumentParser = require('./documentParser');
const DocumentCategorizer = require('./documentCategorizer');
const DatabaseService = require('./database');

class DocumentIndexer {
  constructor(documentsPath, indexPath) {
    this.documentsPath = documentsPath;
    this.indexPath = indexPath;
    this.parser = new DocumentParser();
    this.categorizer = new DocumentCategorizer();
    this.index = null;
    
    // Initialize database
    const dbPath = path.join(indexPath, 'documents.db');
    this.db = new DatabaseService(dbPath);
  }

  async initialize() {
    // Index all documents
    await this.indexAllDocuments();
    
    // Build search index
    this.buildIndex();
  }

  async indexAllDocuments() {
    const files = await this.getAllFiles(this.documentsPath);
    console.log(`Found ${files.length} files to index`);

    for (const filePath of files) {
      try {
        await this.indexDocument(filePath);
      } catch (error) {
        console.error(`Error indexing ${filePath}:`, error.message);
      }
    }
  }

  async getAllFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await this.getAllFiles(filePath, fileList);
      } else if (this.isSupportedFile(file.name)) {
        fileList.push(filePath);
      }
    }

    return fileList;
  }

  isSupportedFile(filename) {
    const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.html', '.pptx'];
    const ext = path.extname(filename).toLowerCase();
    return supportedExtensions.includes(ext);
  }

  async indexDocument(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const relativePath = path.relative(this.documentsPath, filePath);
      
      // Parse document content
      const content = await this.parser.parse(filePath);
      
      // Get file metadata
      const filename = path.basename(filePath);
      const extension = path.extname(filename).toLowerCase();
      
      // Categorize document
      const categories = this.categorizer.categorize(content, filename, relativePath);
      
      // Create document object
      const doc = {
        filename,
        path: relativePath,
        fullPath: filePath,
        content,
        extension,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        categories: categories.topics,
        project: categories.project,
        team: categories.team,
        keywords: this.extractKeywords(content),
        preview: this.generatePreview(content)
      };

      // Insert or update in database
      const docId = this.db.insertOrUpdateDocument(doc);
      console.log(`Indexed: ${filename}`);
      
      return { ...doc, id: docId };
    } catch (error) {
      console.error(`Failed to index ${filePath}:`, error);
      throw error;
    }
  }

  extractKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  generatePreview(content, length = 200) {
    const cleaned = content.replace(/\s+/g, ' ').trim();
    return cleaned.length > length 
      ? cleaned.substring(0, length) + '...' 
      : cleaned;
  }

  buildIndex() {
    const documents = this.db.getAllDocuments();
    
    this.index = lunr(function() {
      this.ref('id');
      this.field('filename', { boost: 10 });
      this.field('content', { boost: 5 });
      this.field('categories', { boost: 8 });
      this.field('project', { boost: 7 });
      this.field('team', { boost: 7 });
      this.field('keywords', { boost: 6 });
      this.field('path', { boost: 3 });

      documents.forEach(doc => {
        this.add({
          id: doc.id,
          filename: doc.filename,
          content: doc.content,
          categories: doc.categories.join(' '),
          project: doc.project || '',
          team: doc.team || '',
          keywords: doc.keywords.join(' '),
          path: doc.path
        });
      });
    });

    console.log(`Index built with ${documents.length} documents`);
  }

  search(query, filters = {}) {
    if (!this.index) {
      return [];
    }

    let results = this.index.search(query);
    
    // Get full document details
    let documents = results.map(result => {
      const doc = this.db.getDocumentById(result.ref);
      return {
        ...doc,
        score: result.score,
        matchData: result.matchData
      };
    });

    // Apply filters
    if (filters.extension) {
      documents = documents.filter(doc => 
        doc.extension === filters.extension
      );
    }

    if (filters.category) {
      documents = documents.filter(doc => 
        doc.categories.includes(filters.category)
      );
    }

    if (filters.project) {
      documents = documents.filter(doc => 
        doc.project === filters.project
      );
    }

    if (filters.team) {
      documents = documents.filter(doc => 
        doc.team === filters.team
      );
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      documents = documents.filter(doc => 
        new Date(doc.modified) >= dateFrom
      );
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      documents = documents.filter(doc => 
        new Date(doc.modified) <= dateTo
      );
    }

    return documents;
  }

  async reindexDocument(filePath) {
    // Index new version (DB handles upsert)
    await this.indexDocument(filePath);
    
    // Rebuild index
    this.buildIndex();
  }

  async removeDocument(filePath) {
    this.db.deleteDocument(filePath);
    this.buildIndex();
  }

  watchFiles() {
    const watcher = chokidar.watch(this.documentsPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', async (filePath) => {
        if (this.isSupportedFile(filePath)) {
          console.log(`New file detected: ${filePath}`);
          await this.reindexDocument(filePath);
        }
      })
      .on('change', async (filePath) => {
        if (this.isSupportedFile(filePath)) {
          console.log(`File changed: ${filePath}`);
          await this.reindexDocument(filePath);
        }
      })
      .on('unlink', async (filePath) => {
        console.log(`File removed: ${filePath}`);
        await this.removeDocument(filePath);
      });

    console.log('File watcher initialized');
  }

  getCategories() {
    return this.db.getCategories();
  }



  getStats() {
    return this.db.getStats();
  }
}

module.exports = DocumentIndexer;
