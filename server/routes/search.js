const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const { q, extension, category, project, team, dateFrom, dateTo } = req.query;

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

    const results = documentIndexer.search(q, filters);

    res.json({
      query: q,
      filters,
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
        score: doc.score,
        url: `/files/${doc.path}`
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

router.get('/filters', (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const filters = documentIndexer.getCategories();
    res.json(filters);
  } catch (error) {
    console.error('Filter fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const stats = documentIndexer.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
