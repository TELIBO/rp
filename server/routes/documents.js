const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const documents = await documentIndexer.db.getAllDocuments();

    const simplifiedDocs = documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      path: doc.path,
      extension: doc.extension,
      size: doc.size,
      modified: doc.modified,
      categories: doc.categories || [],
      project: doc.project,
      team: doc.team,
     url: `/files/${encodeURIComponent(doc.path)}`
    }));

    res.json({
      total: simplifiedDocs.length,
      documents: simplifiedDocs
    });
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const documentIndexer = req.app.get('documentIndexer');
    const doc = await documentIndexer.db.getDocumentById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Categories and keywords are already parsed by database service
    const parsedDoc = {
      ...doc,
      url: `/files/${encodeURIComponent(doc.path)}`
    };

    res.json(parsedDoc);
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

module.exports = router;
