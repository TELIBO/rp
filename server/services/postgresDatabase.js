const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

class PostgresService {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    this.sql = neon(process.env.DATABASE_URL);
    this.initialized = false;
  }

  async initialize() {
    try {
      // Try to enable pgvector extension first
      let vectorEnabled = false;
      try {
        await this.sql`CREATE EXTENSION IF NOT EXISTS vector`;
        vectorEnabled = true;
        console.log('pgvector extension enabled');
      } catch (error) {
        console.log('pgvector not available, continuing without vector storage in DB');
      }

      // Create documents table (with or without vector column)
      if (vectorEnabled) {
        await this.sql`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            path TEXT UNIQUE NOT NULL,
            full_path TEXT NOT NULL,
            content TEXT,
            extension TEXT,
            size INTEGER,
            created TIMESTAMP,
            modified TIMESTAMP,
            categories JSONB DEFAULT '[]',
            project TEXT,
            team TEXT,
            keywords JSONB DEFAULT '[]',
            preview TEXT,
            embedding vector(384),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
      } else {
        await this.sql`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            path TEXT UNIQUE NOT NULL,
            full_path TEXT NOT NULL,
            content TEXT,
            extension TEXT,
            size INTEGER,
            created TIMESTAMP,
            modified TIMESTAMP,
            categories JSONB DEFAULT '[]',
            project TEXT,
            team TEXT,
            keywords JSONB DEFAULT '[]',
            preview TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
      }

      // Create indexes
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_extension ON documents(extension)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_categories ON documents USING GIN(categories)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_modified ON documents(modified)
      `;

      // Create full-text search index
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_content_search 
        ON documents USING GIN(to_tsvector('english', content))
      `;

      // Create vector index if extension is available
      if (vectorEnabled) {
        try {
          await this.sql`
            CREATE INDEX IF NOT EXISTS idx_documents_embedding 
            ON documents USING ivfflat (embedding vector_cosine_ops)
          `;
        } catch (error) {
          console.log('Vector index creation skipped');
        }
      }

      this.vectorEnabled = vectorEnabled;
      this.initialized = true;
      console.log('PostgreSQL database initialized');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  generateDocId(filePath) {
    return crypto.createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  async insertOrUpdateDocument(doc) {
    const docId = this.generateDocId(doc.fullPath);
    
    try {
      await this.sql`
        INSERT INTO documents (
          id, filename, path, full_path, content, extension, size, 
          created, modified, categories, project, team, keywords, preview
        )
        VALUES (
          ${docId}, ${doc.filename}, ${doc.path}, ${doc.fullPath}, 
          ${doc.content}, ${doc.extension}, ${doc.size},
          ${doc.created}, ${doc.modified}, ${JSON.stringify(doc.categories)},
          ${doc.project}, ${doc.team}, ${JSON.stringify(doc.keywords)}, ${doc.preview}
        )
        ON CONFLICT (path) 
        DO UPDATE SET
          filename = EXCLUDED.filename,
          content = EXCLUDED.content,
          extension = EXCLUDED.extension,
          size = EXCLUDED.size,
          modified = EXCLUDED.modified,
          categories = EXCLUDED.categories,
          project = EXCLUDED.project,
          team = EXCLUDED.team,
          keywords = EXCLUDED.keywords,
          preview = EXCLUDED.preview,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      return docId;
    } catch (error) {
      console.error('Error inserting/updating document:', error);
      throw error;
    }
  }

  async updateEmbedding(docId, embedding) {
    if (!this.vectorEnabled) return;
    
    try {
      const embeddingString = `[${embedding.join(',')}]`;
      await this.sql`
        UPDATE documents 
        SET embedding = ${embeddingString}::vector
        WHERE id = ${docId}
      `;
    } catch (error) {
      console.error('Error updating embedding:', error);
    }
  }

  async getAllDocuments() {
    try {
      const results = await this.sql`
        SELECT 
          id, filename, path, full_path as "fullPath", content, extension, 
          size, created, modified, categories, project, team, keywords, preview
        FROM documents 
        ORDER BY modified DESC
      `;
      
      return results.map(doc => ({
        ...doc,
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        keywords: Array.isArray(doc.keywords) ? doc.keywords : []
      }));
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  }

  async getDocumentById(id) {
    try {
      const results = await this.sql`
        SELECT 
          id, filename, path, full_path as "fullPath", content, extension, 
          size, created, modified, categories, project, team, keywords, preview
        FROM documents 
        WHERE id = ${id}
      `;
      
      if (results.length === 0) return null;
      
      const doc = results[0];
      return {
        ...doc,
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        keywords: Array.isArray(doc.keywords) ? doc.keywords : []
      };
    } catch (error) {
      console.error('Error getting document by id:', error);
      return null;
    }
  }

  async getDocumentByPath(path) {
    try {
      const results = await this.sql`
        SELECT 
          id, filename, path, full_path as "fullPath", content, extension, 
          size, created, modified, categories, project, team, keywords, preview
        FROM documents 
        WHERE path = ${path}
      `;
      
      if (results.length === 0) return null;
      
      const doc = results[0];
      return {
        ...doc,
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        keywords: Array.isArray(doc.keywords) ? doc.keywords : []
      };
    } catch (error) {
      console.error('Error getting document by path:', error);
      return null;
    }
  }

  async deleteDocument(filePath) {
    try {
      const docId = this.generateDocId(filePath);
      await this.sql`DELETE FROM documents WHERE id = ${docId}`;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async getCategories() {
    try {
      const results = await this.sql`
        SELECT DISTINCT 
          jsonb_array_elements_text(categories) as category
        FROM documents
        WHERE categories IS NOT NULL
        ORDER BY category
      `;
      
      const categories = results.map(r => r.category);
      
      const projects = await this.sql`
        SELECT DISTINCT project 
        FROM documents 
        WHERE project IS NOT NULL 
        ORDER BY project
      `;
      
      const teams = await this.sql`
        SELECT DISTINCT team 
        FROM documents 
        WHERE team IS NOT NULL 
        ORDER BY team
      `;
      
      const extensions = await this.sql`
        SELECT DISTINCT extension 
        FROM documents 
        ORDER BY extension
      `;
      
      return {
        categories,
        projects: projects.map(p => p.project),
        teams: teams.map(t => t.team),
        extensions: extensions.map(e => e.extension)
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return { categories: [], projects: [], teams: [], extensions: [] };
    }
  }

  async getStats() {
    try {
      const result = await this.sql`
        SELECT 
          COUNT(*) as "totalDocuments",
          COUNT(DISTINCT project) as "totalProjects",
          COUNT(DISTINCT team) as "totalTeams",
          SUM(size) as "totalSize"
        FROM documents
      `;
      
      const categoriesResult = await this.sql`
        SELECT COUNT(DISTINCT category) as "totalCategories"
        FROM documents, jsonb_array_elements_text(categories) as category
      `;
      
      const stats = result[0];
      const categoryStats = categoriesResult[0];
      
      const recentDocs = await this.sql`
        SELECT filename, modified 
        FROM documents 
        ORDER BY modified DESC 
        LIMIT 5
      `;
      
      const topCategories = await this.sql`
        SELECT category as name, COUNT(*) as count
        FROM documents, jsonb_array_elements_text(categories) as category
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5
      `;
      
      const fileTypes = await this.sql`
        SELECT extension, COUNT(*) as count, SUM(size) as "totalSize"
        FROM documents
        GROUP BY extension
        ORDER BY count DESC
      `;
      
      return {
        totalDocuments: parseInt(stats.totalDocuments) || 0,
        totalCategories: parseInt(categoryStats.totalCategories) || 0,
        totalProjects: parseInt(stats.totalProjects) || 0,
        totalTeams: parseInt(stats.totalTeams) || 0,
        totalSize: parseInt(stats.totalSize) || 0,
        recentDocuments: recentDocs,
        topCategories: topCategories.map(cat => ({
          name: cat.name,
          count: parseInt(cat.count)
        })),
        fileTypes: fileTypes.map(ft => ({
          extension: ft.extension,
          count: parseInt(ft.count),
          totalSize: parseInt(ft.totalSize) || 0
        }))
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDocuments: 0,
        totalCategories: 0,
        totalProjects: 0,
        totalTeams: 0,
        totalSize: 0,
        recentDocuments: [],
        topCategories: [],
        fileTypes: []
      };
    }
  }

  async fullTextSearch(query, limit = 50) {
    try {
      const results = await this.sql`
        SELECT 
          id, filename, path, full_path as "fullPath", content, extension, 
          size, created, modified, categories, project, team, keywords, preview,
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) as rank
        FROM documents
        WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;
      
      return results.map(doc => ({
        ...doc,
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
        score: doc.rank
      }));
    } catch (error) {
      console.error('Full-text search error:', error);
      return [];
    }
  }

  async vectorSearch(embedding, limit = 10) {
    try {
      const embeddingString = `[${embedding.join(',')}]`;
      const results = await this.sql`
        SELECT 
          id, filename, path, full_path as "fullPath", content, extension, 
          size, created, modified, categories, project, team, keywords, preview,
          1 - (embedding <=> ${embeddingString}::vector) as similarity
        FROM documents
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${embeddingString}::vector
        LIMIT ${limit}
      `;
      
      return results.map(doc => ({
        ...doc,
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
        score: doc.similarity
      }));
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }
}

module.exports = PostgresService;
