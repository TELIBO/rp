const { QdrantClient } = require('@qdrant/js-client-rest');

class VectorSearchService {
  constructor() {
    this.client = null;
    this.embedder = null;
    this.collectionName = 'marketing_documents';
    this.vectorSize = 384; // all-MiniLM-L6-v2 dimension
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize Qdrant client (in-memory mode or connect to server)
      this.client = new QdrantClient({ 
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        checkCompatibility: false
      });

      // Initialize embedding model (runs locally) - dynamic import for ES module
      const { pipeline } = await import('@xenova/transformers');
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      // Create collection if it doesn't exist
      try {
        await this.client.getCollection(this.collectionName);
        console.log('Vector collection exists');
      } catch (error) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine'
          }
        });
        console.log('Vector collection created');
      }

      this.initialized = true;
      console.log('Vector search initialized');
    } catch (error) {
      console.error('Vector search initialization failed:', error.message);
      console.log('Continuing without vector search...');
      this.initialized = false;
    }
  }

  async generateEmbedding(text) {
    if (!this.embedder) return null;
    
    try {
      const output = await this.embedder(text, {
        pooling: 'mean',
        normalize: true
      });
      return Array.from(output.data);
    } catch (error) {
      console.error('Embedding generation failed:', error.message);
      return null;
    }
  }

  async indexDocument(doc) {
    if (!this.initialized || !this.client) return false;

    try {
      // Generate embedding from content + filename
      const text = `${doc.filename} ${doc.content}`.slice(0, 5000);
      const vector = await this.generateEmbedding(text);
      
      if (!vector) return false;

      // Upsert document vector
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: doc.id,
            vector: vector,
            payload: {
              filename: doc.filename,
              categories: doc.categories,
              project: doc.project,
              extension: doc.extension,
              preview: doc.preview
            }
          }
        ]
      });

      return true;
    } catch (error) {
      console.error('Vector indexing failed:', error.message);
      return false;
    }
  }

  async semanticSearch(query, limit = 10, filter = null) {
    if (!this.initialized || !this.client) return [];

    try {
      // Generate query embedding
      const queryVector = await this.generateEmbedding(query);
      if (!queryVector) return [];

      // Search similar vectors
      const searchParams = {
        vector: queryVector,
        limit: limit,
        with_payload: true
      };

      if (filter) {
        searchParams.filter = filter;
      }

      const results = await this.client.search(this.collectionName, searchParams);

      return results.map(result => ({
        id: result.id,
        score: result.score,
        ...result.payload
      }));
    } catch (error) {
      console.error('Semantic search failed:', error.message);
      return [];
    }
  }

  async deleteDocument(docId) {
    if (!this.initialized || !this.client) return false;

    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [docId]
      });
      return true;
    } catch (error) {
      console.error('Vector deletion failed:', error.message);
      return false;
    }
  }

  async hybridSearch(query, lexicalResults, limit = 10) {
    if (!this.initialized) return lexicalResults;

    try {
      // Get semantic results
      const semanticResults = await this.semanticSearch(query, limit * 2);
      
      // Merge with lexical results using reciprocal rank fusion
      const merged = new Map();
      
      // Add lexical results with their ranks
      lexicalResults.forEach((doc, index) => {
        const score = 1 / (index + 1);
        merged.set(doc.id, {
          ...doc,
          fusionScore: score,
          lexicalRank: index + 1
        });
      });
      
      // Add or boost semantic results
      semanticResults.forEach((doc, index) => {
        const score = 1 / (index + 1);
        const existing = merged.get(doc.id);
        
        if (existing) {
          existing.fusionScore += score;
          existing.semanticRank = index + 1;
        } else {
          merged.set(doc.id, {
            ...doc,
            fusionScore: score,
            semanticRank: index + 1
          });
        }
      });
      
      // Sort by fusion score and return
      return Array.from(merged.values())
        .sort((a, b) => b.fusionScore - a.fusionScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Hybrid search failed:', error.message);
      return lexicalResults;
    }
  }
}

module.exports = new VectorSearchService();
