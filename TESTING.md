# 🧪 Testing Guide

## Quick Test Checklist

### ✅ Backend Test (5 minutes)

1. **Start the backend server:**
```bash
npm run server
```

2. **Verify server is running:**
- Look for: "Server running on port 5000"
- Look for: "Document indexing completed"
- Look for: "File watching enabled"

3. **Test API endpoints:**

**Health check:**
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","message":"Search API is running"}`

**Get statistics:**
```bash
curl http://localhost:5000/api/search/stats
```
Expected: JSON with totalDocuments, categories, etc.

**Search test:**
```bash
curl "http://localhost:5000/api/search?q=social"
```
Expected: JSON with search results

4. **Test file watcher:**
- Create a new .txt file in `documents/` folder
- Watch console - should see "New file detected"
- File should be automatically indexed

### ✅ Frontend Test (5 minutes)

1. **Start the React app:**
```bash
cd client
npm start
```

2. **Verify app loads:**
- Opens browser automatically at http://localhost:3000
- See "Marketing Knowledge Hub" header
- See statistics dashboard with 3 documents

3. **Test search:**
- Type "social" in search bar
- Click Search button
- Should see "social-media-campaign-q4.md" result
- Result should have preview text
- See category tags

4. **Test filters:**
- Search for "brand"
- Try filtering by File Type: .MD
- Try filtering by Category
- Results should update

5. **Test upload:**
- Click "Upload Files" button
- Modal should open
- Drag a .txt file or click to browse
- Upload the file
- Should see success message
- File should appear in search results

### ✅ Full Integration Test (10 minutes)

1. **Start both servers:**
```bash
npm run dev
```

2. **Create test document:**
Create `documents/test-document.txt` with content:
```
Test Marketing Document
This is a test for social media campaign and email marketing.
Project: Test Campaign 2024
Team: Content Team
```

3. **Search for the document:**
- Wait a few seconds for indexing
- Search for "test campaign"
- Should find the new document
- Should be categorized appropriately

4. **Test all features:**
- ✅ Search finds relevant results
- ✅ Filters work correctly
- ✅ Results show preview
- ✅ Can click to view document
- ✅ Can download document
- ✅ Statistics show correct count
- ✅ Upload works
- ✅ Categories are assigned
- ✅ File watcher detects changes

### ✅ Search Accuracy Test

Try these search queries:

1. **"social media"** - Should find social-media-campaign-q4.md
2. **"brand"** - Should find brand-guidelines.md
3. **"email"** - Should find email-marketing-holiday.md
4. **"holiday"** - Should find email-marketing-holiday.md
5. **"instagram"** - Should find social-media-campaign-q4.md
6. **"color"** - Should find brand-guidelines.md
7. **"campaign"** - Should find multiple documents

### ✅ Category Detection Test

Check if documents are categorized correctly:

| Document | Expected Categories |
|----------|-------------------|
| social-media-campaign-q4.md | Social Media, Content Marketing |
| brand-guidelines.md | Brand Strategy, Design |
| email-marketing-holiday.md | Email Marketing, Content Marketing |

### ✅ Filter Combinations Test

1. Search "marketing"
2. Filter by Extension: .md
3. Filter by Category: Social Media
4. Should only show social media .md files

### ✅ Upload Test Cases

**Supported formats to test:**
- ✅ .pdf file
- ✅ .docx file
- ✅ .txt file
- ✅ .md file
- ✅ .html file

**Should reject:**
- ❌ .exe file
- ❌ .zip file
- ❌ Files over 50MB

### ✅ Performance Test

1. Add 20+ documents to the folder
2. Check indexing speed (should be quick)
3. Test search performance (should be instant)
4. Test filter response time (should be immediate)

### ✅ UI Responsiveness Test

Test on different screen sizes:
- 🖥️ Desktop (1920x1080)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667)

All features should work on all sizes.

### ✅ Error Handling Test

**Test error scenarios:**
1. Search with empty query - should show message
2. Upload unsupported file - should show error
3. Upload file too large - should show error
4. Stop backend, try search - should handle gracefully

### ✅ Real-time Monitoring Test

1. Start servers
2. Add a document to `documents/` folder manually
3. Within seconds, search should find it
4. Modify a document
5. Re-index should happen automatically
6. Delete a document
7. Should be removed from search results

## 🐛 Common Issues & Solutions

### Issue: Server keeps restarting
**Solution:** Check nodemon.json excludes index/ and documents/

### Issue: Documents not indexed
**Solution:** 
- Check file format is supported
- Check file isn't corrupted
- Check console for errors

### Issue: Search returns no results
**Solution:**
- Verify documents are indexed (check console)
- Try simpler search terms
- Check if filters are too restrictive

### Issue: Upload fails
**Solution:**
- Check file size < 50MB
- Verify file format is supported
- Check backend is running

### Issue: Frontend can't reach backend
**Solution:**
- Verify backend is on port 5000
- Check CORS is enabled
- Check no firewall blocking

## ✅ Final Verification

Everything working if you can:
1. ✅ Start both servers without errors
2. ✅ See sample documents indexed
3. ✅ Search finds relevant results
4. ✅ Filters work correctly
5. ✅ Upload adds new documents
6. ✅ File watcher detects changes
7. ✅ UI looks good and is responsive
8. ✅ No errors in browser console
9. ✅ No errors in server console
10. ✅ All features work as expected

## 🎉 Success!

If all tests pass, your Marketing Knowledge Hub is fully functional and ready to use!

**Happy searching! 🚀**
