const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class DatabaseService {
  constructor(dbPath) {
    const dbDir = path.dirname(dbPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeSchema();
  }

  initializeSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        fullPath TEXT NOT NULL UNIQUE,
        content TEXT,
        extension TEXT,
        size INTEGER,
        created TEXT,
        modified TEXT,
        project TEXT,
        team TEXT,
        preview TEXT,
        keywords TEXT,
        UNIQUE(fullPath)
      );

      CREATE TABLE IF NOT EXISTS document_categories (
        document_id TEXT NOT NULL,
        category TEXT NOT NULL,
        score INTEGER DEFAULT 1,
        PRIMARY KEY (document_id, category),
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_documents_path ON documents(path);
      CREATE INDEX IF NOT EXISTS idx_documents_extension ON documents(extension);
      CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project);
      CREATE INDEX IF NOT EXISTS idx_documents_team ON documents(team);
      CREATE INDEX IF NOT EXISTS idx_documents_modified ON documents(modified);
      CREATE INDEX IF NOT EXISTS idx_categories_document ON document_categories(document_id);
      CREATE INDEX IF NOT EXISTS idx_categories_category ON document_categories(category);
    `;

    this.db.exec(schema);
  }

  generateDocumentId(fullPath) {
    // Deterministic ID based on file path hash
    return crypto.createHash('sha256').update(fullPath).digest('hex').substring(0, 32);
  }

  insertOrUpdateDocument(doc) {
    const id = this.generateDocumentId(doc.fullPath);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents 
      (id, filename, path, fullPath, content, extension, size, created, modified, project, team, preview, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      doc.filename,
      doc.path,
      doc.fullPath,
      doc.content,
      doc.extension,
      doc.size,
      doc.created instanceof Date ? doc.created.toISOString() : doc.created,
      doc.modified instanceof Date ? doc.modified.toISOString() : doc.modified,
      doc.project || null,
      doc.team || null,
      doc.preview,
      JSON.stringify(doc.keywords || [])
    );

    // Delete old categories
    this.db.prepare('DELETE FROM document_categories WHERE document_id = ?').run(id);

    // Insert new categories
    if (doc.categories && doc.categories.length > 0) {
      const catStmt = this.db.prepare(`
        INSERT INTO document_categories (document_id, category, score)
        VALUES (?, ?, ?)
      `);

      for (const category of doc.categories) {
        catStmt.run(id, category, 1);
      }
    }

    return id;
  }

  getDocumentById(id) {
    const doc = this.db.prepare(`
      SELECT * FROM documents WHERE id = ?
    `).get(id);

    if (!doc) return null;

    // Get categories
    const categories = this.db.prepare(`
      SELECT category FROM document_categories WHERE document_id = ? ORDER BY score DESC
    `).all(id).map(row => row.category);

    return {
      ...doc,
      keywords: JSON.parse(doc.keywords || '[]'),
      categories
    };
  }

  getDocumentByPath(fullPath) {
    const id = this.generateDocumentId(fullPath);
    return this.getDocumentById(id);
  }

  getAllDocuments() {
    const docs = this.db.prepare('SELECT * FROM documents').all();
    
    return docs.map(doc => {
      const categories = this.db.prepare(`
        SELECT category FROM document_categories WHERE document_id = ? ORDER BY score DESC
      `).all(doc.id).map(row => row.category);

      return {
        ...doc,
        keywords: JSON.parse(doc.keywords || '[]'),
        categories
      };
    });
  }

  deleteDocument(fullPath) {
    const id = this.generateDocumentId(fullPath);
    this.db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  }

  getCategories() {
    const categories = this.db.prepare(`
      SELECT DISTINCT category FROM document_categories ORDER BY category
    `).all().map(row => row.category);

    const projects = this.db.prepare(`
      SELECT DISTINCT project FROM documents WHERE project IS NOT NULL ORDER BY project
    `).all().map(row => row.project);

    const teams = this.db.prepare(`
      SELECT DISTINCT team FROM documents WHERE team IS NOT NULL ORDER BY team
    `).all().map(row => row.team);

    const extensions = this.db.prepare(`
      SELECT DISTINCT extension FROM documents ORDER BY extension
    `).all().map(row => row.extension);

    return {
      categories,
      projects,
      teams,
      extensions
    };
  }

  getStats() {
    const totalDocuments = this.db.prepare('SELECT COUNT(*) as count FROM documents').get().count;
    const totalSize = this.db.prepare('SELECT SUM(size) as total FROM documents').get().total || 0;
    const categories = this.getCategories();

    return {
      totalDocuments,
      totalSize,
      categories,
      lastUpdated: new Date().toISOString()
    };
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseService;
