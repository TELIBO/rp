const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'index', 'documents.db');
console.log('Opening database:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  
  // Count documents
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM documents');
  const count = countStmt.get();
  console.log('\nTotal documents in database:', count.count);
  
  // Get all documents
  if (count.count > 0) {
    const docsStmt = db.prepare('SELECT id, filename, extension, size, project FROM documents LIMIT 5');
    const docs = docsStmt.all();
    console.log('\nFirst 5 documents:');
    docs.forEach(doc => {
      console.log(`  - ${doc.filename} (${doc.extension}) - ${doc.size} bytes - Project: ${doc.project}`);
    });
  }
  
  db.close();
  console.log('\nDatabase check complete!');
} catch (error) {
  console.error('Error checking database:', error.message);
}
