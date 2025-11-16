const fs = require('fs').promises;
const path = require('path');
const lunr = require('lunr');
let chokidar;
try {
  chokidar = require('chokidar');
} catch (err) {
  console.log('Chokidar not available - file watching disabled');
}
const DocumentParser = require('./documentParser');
const { categorizeDocument } = require('./documentCategorizer');
const PostgresService = require('./postgresDatabase');
const vectorSearch = require('./vectorSearch');

class DocumentIndexer {
  constructor(documentsPath, indexPath) {
    this.documentsPath = documentsPath;
    this.indexPath = indexPath;
    this.parser = new DocumentParser();
    this.index = null;
    
    // Initialize PostgreSQL database
    this.db = new PostgresService();
  }

  async initialize() {
    // Initialize database
    await this.db.initialize();
    
    // Initialize vector search
    await vectorSearch.initialize();
    
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
      const categoryResult = categorizeDocument(content, filename);
      
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
        categories: [categoryResult.category],
        project: categoryResult.projects.length > 0 ? categoryResult.projects[0] : null,
        team: categoryResult.team || null,
        keywords: this.extractKeywords(content),
        preview: this.generateSummary(content, filename, categoryResult)
      };

      // Insert or update in database
      const docId = await this.db.insertOrUpdateDocument(doc);
      console.log(`Indexed: ${filename}`);
      
      // Index in vector database
      const docWithId = { ...doc, id: docId };
      await vectorSearch.indexDocument(docWithId);
      
      // Store embedding in PostgreSQL if available
      if (vectorSearch.initialized) {
        const embedding = await vectorSearch.generateEmbedding(
          `${doc.filename} ${doc.content}`.slice(0, 5000)
        );
        if (embedding) {
          await this.db.updateEmbedding(docId, embedding);
        }
      }
      
      return docWithId;
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
    // Clean and normalize the content
    const cleaned = content.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length === 0) {
      return 'No preview available';
    }
    
    // Try to extract meaningful sentences for summary
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    
    // Build summary from complete sentences
    let summary = '';
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (summary.length + trimmedSentence.length <= length) {
        summary += trimmedSentence + ' ';
      } else {
        // If we have at least one sentence, use it
        if (summary.length > 0) {
          break;
        }
        // Otherwise, truncate the first sentence
        summary = trimmedSentence.substring(0, length) + '...';
        break;
      }
    }
    
    // Clean up the summary
    summary = summary.trim();
    
    // If summary is still too long or empty, fallback to simple truncation
    if (summary.length === 0) {
      summary = cleaned.substring(0, length) + '...';
    } else if (summary.length > length) {
      summary = summary.substring(0, length) + '...';
    }
    
    return summary;
  }

  generateSummary(content, filename, categoryResult) {
    const cleaned = content.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length === 0) {
      return `${categoryResult.category} document - ${filename}`;
    }
    
    // Extract first meaningful paragraph or sentences
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
    
    // Build an intelligent summary
    let summary = '';
    
    // Add category context
    summary = `[${categoryResult.category}] `;
    
    // Add team if available
    if (categoryResult.team) {
      summary += `${categoryResult.team} - `;
    }
    
    // Add key information from content
    const maxLength = 250;
    let contentSummary = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Skip very short sentences (likely headers or noise)
      if (trimmed.length < 20) continue;
      
      if (contentSummary.length + trimmed.length <= maxLength) {
        contentSummary += trimmed + ' ';
      } else {
        if (contentSummary.length === 0) {
          contentSummary = trimmed.substring(0, maxLength);
        }
        break;
      }
    }
    
    // If no meaningful sentences, take first chunk
    if (contentSummary.length === 0) {
      contentSummary = cleaned.substring(0, maxLength);
    }
    
    summary += contentSummary.trim();
    
    // Add keywords if summary is short
    if (summary.length < 150 && categoryResult.keywords && categoryResult.keywords.length > 0) {
      const topKeywords = categoryResult.keywords.slice(0, 5).join(', ');
      summary += ` | Keywords: ${topKeywords}`;
    }
    
    // Ensure it doesn't end abruptly
    if (!summary.match(/[.!?]$/)) {
      summary += '...';
    }
    
    return summary;
  }

  buildIndex() {
    const documents = this.db.getAllDocuments();
    
    // Handle async getAllDocuments
    if (documents instanceof Promise) {
      documents.then(docs => {
        this.index = lunr(function() {
          this.ref('id');
          this.field('filename', { boost: 10 });
          this.field('content', { boost: 5 });
          this.field('categories', { boost: 8 });
          this.field('project', { boost: 7 });
          this.field('team', { boost: 7 });
          this.field('keywords', { boost: 6 });
          this.field('path', { boost: 3 });

          docs.forEach(doc => {
            this.add({
              id: doc.id,
              filename: doc.filename,
              content: doc.content || '',
              categories: (doc.categories || []).join(' '),
              project: doc.project || '',
              team: doc.team || '',
              keywords: (doc.keywords || []).join(' '),
              path: doc.path
            });
          });
        });

        console.log(`Index built with ${docs.length} documents`);
      });
    } else {
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
            content: doc.content || '',
            categories: (doc.categories || []).join(' '),
            project: doc.project || '',
            team: doc.team || '',
            keywords: (doc.keywords || []).join(' '),
            path: doc.path
          });
        });
      });

      console.log(`Index built with ${documents.length} documents`);
    }
  }

  search(query, filters = {}) {
    if (!this.index) {
      return [];
    }

    let results = this.index.search(query);
    
    // Get full document details (handle async)
    const getDocuments = async () => {
      const documents = [];
      for (const result of results) {
        const doc = await this.db.getDocumentById(result.ref);
        if (doc) {
          documents.push({
            ...doc,
            score: result.score,
            matchData: result.matchData
          });
        }
      }
      return documents;
    };

    return getDocuments().then(documents => {
      // Apply filters
      if (filters.extension) {
        documents = documents.filter(doc => 
          doc.extension === filters.extension
        );
      }

      if (filters.category) {
        documents = documents.filter(doc => 
          (doc.categories || []).includes(filters.category)
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
    });
  }

  async semanticSearch(query, filters = {}, limit = 10) {
    // Perform lexical search first
    const lexicalResults = await this.search(query, filters);
    
    // Enhance with semantic search
    const hybridResults = await vectorSearch.hybridSearch(
      query,
      lexicalResults,
      limit
    );
    
    // Re-fetch full document details for any new semantic results
    const finalResults = [];
    for (const result of hybridResults) {
      if (!result.fullPath) {
        const doc = await this.db.getDocumentById(result.id);
        if (doc) {
          finalResults.push({ ...doc, ...result });
        }
      } else {
        finalResults.push(result);
      }
    }
    
    return finalResults;
  }

  async reindexDocument(filePath) {
    // Index new version (DB handles upsert)
    await this.indexDocument(filePath);
    
    // Rebuild index
    this.buildIndex();
  }

  async removeDocument(filePath) {
    const doc = this.db.getDocumentByPath(path.relative(this.documentsPath, filePath));
    if (doc) {
      await vectorSearch.deleteDocument(doc.id);
    }
    this.db.deleteDocument(filePath);
    this.buildIndex();
  }

  watchFiles() {
    if (!chokidar) {
      console.log('File watching disabled (chokidar not available)');
      return;
    }
    
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

  async getCategories() {
    return await this.db.getCategories();
  }

  async getStats() {
    return await this.db.getStats();
  }
}

module.exports = DocumentIndexer;
