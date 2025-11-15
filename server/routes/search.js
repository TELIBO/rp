const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const { q, extension, category, project, team, dateFrom, dateTo, semantic } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const filters = {
      extension: extension || null,
      category: category || null,
      project: project || null,
      team: team || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null
    };

    // Use semantic search if requested
    const results = semantic === 'true' 
      ? await documentIndexer.semanticSearch(q, filters)
      : await documentIndexer.search(q, filters);

    res.json({
      query: q,
      filters,
      semantic: semantic === 'true',
      total: results.length,
      results: results.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        path: doc.path,
        extension: doc.extension,
        size: doc.size,
        modified: doc.modified,
        categories: doc.categories,
        project: doc.project,
        team: doc.team,
        preview: doc.preview,
        content: doc.content, // Include full content for preview
        score: doc.score,
        fusionScore: doc.fusionScore,
        url: `/files/${doc.path}`
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

router.get('/filters', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const filters = await documentIndexer.getCategories();
    res.json(filters);
  } catch (error) {
    console.error('Filter fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const stats = await documentIndexer.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
