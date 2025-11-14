const http = require('http');

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Marketing Search Tool API\n');
  console.log('='.repeat(50));

  // Test 1: Get all documents
  console.log('\n1. Testing /api/documents');
  try {
    const docs = await testAPI('/api/documents');
    console.log(`   ✓ Total documents: ${docs.total}`);
    if (docs.documents && docs.documents.length > 0) {
      console.log(`   ✓ First document: ${docs.documents[0].filename}`);
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }

  // Test 2: Search
  console.log('\n2. Testing /api/search?q=brand');
  try {
    const search = await testAPI('/api/search?q=brand');
    console.log(`   ✓ Search results: ${search.total} matches`);
    if (search.results && search.results.length > 0) {
      console.log(`   ✓ Top result: ${search.results[0].filename}`);
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }

  // Test 3: Get stats
  console.log('\n3. Testing /api/search/stats');
  try {
    const stats = await testAPI('/api/search/stats');
    console.log(`   ✓ Total documents: ${stats.totalDocuments}`);
    console.log(`   ✓ Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }

  // Test 4: Get filters
  console.log('\n4. Testing /api/search/filters');
  try {
    const filters = await testAPI('/api/search/filters');
    console.log(`   ✓ Extensions: ${filters.extensions.length}`);
    console.log(`   ✓ Projects: ${filters.projects.length}`);
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('API tests complete!\n');
}

runTests();
