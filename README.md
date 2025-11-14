# 📚 Marketing Knowledge Hub

A powerful internal search tool designed to help marketing teams quickly find documents, assets, and information across their entire knowledge base. Built with intelligent indexing, automatic categorization, and a clean, intuitive interface.

## ✨ Features

### 🔍 Smart Search
- **Full-text search** across all document content
- **Multi-format support**: PDF, DOCX, DOC, TXT, MD, HTML, PPTX
- **Relevance scoring** with Lunr.js for accurate results
- **Real-time search** with instant feedback

### 🏷️ Automatic Categorization
- **Topic detection**: Automatically categorizes by marketing activities
  - Brand Strategy, Social Media, Content Marketing
  - Email Marketing, Analytics, Advertising
  - Product Launch, PR, Design, Video, Research
- **Team assignment**: Identifies relevant teams
- **Project extraction**: Organizes by project from folder structure
- **Keyword extraction**: Top keywords for quick scanning

### 🎯 Advanced Filtering
- Filter by **file type** (PDF, DOCX, TXT, etc.)
- Filter by **category** (Brand, Social, Content, etc.)
- Filter by **project**
- Filter by **team**
- Filter by **date range**

### 📊 Statistics Dashboard
- Total documents indexed
- Categories, projects, and teams overview
- Quick access to top categories and active projects

### 📤 File Upload & Management
- **Drag-and-drop** file upload
- **Automatic indexing** of new files
- **Real-time monitoring** with file watcher
- **Live updates** when files change

### 👀 Document Preview
- Quick preview of document content
- Direct links to open full documents
- Download option
- Metadata display (size, date, team, project)

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the repository**
```bash
cd e:\rp
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Create environment file**
```bash
copy .env.example .env
```

The default `.env` configuration:
```
PORT=5000
DOCUMENTS_PATH=./documents
INDEX_PATH=./index
NODE_ENV=development
```

### Running the Application

#### Option 1: Run both servers concurrently (Recommended)
```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 3000) simultaneously.

#### Option 2: Run servers separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

The backend API runs on:
```
http://localhost:5000
```

## 📁 Project Structure

```
marketing-search-tool/
├── server/
│   ├── index.js                 # Express server setup
│   ├── routes/
│   │   ├── search.js           # Search endpoints
│   │   ├── upload.js           # File upload handling
│   │   └── documents.js        # Document management
│   └── services/
│       ├── documentIndexer.js  # Main indexing logic
│       ├── documentParser.js   # Multi-format file parsing
│       └── documentCategorizer.js  # Auto-categorization
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.js    # Search input
│   │   │   ├── SearchResults.js # Results display
│   │   │   ├── Filters.js      # Filter sidebar
│   │   │   ├── Statistics.js   # Stats dashboard
│   │   │   └── UploadModal.js  # File upload modal
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   └── App.js              # Main app component
│   └── public/
├── documents/                   # Your document library (auto-created)
├── index/                      # Search index storage (auto-created)
└── package.json
```

## 📖 Usage Guide

### 1. Adding Documents

**Method 1: Upload via UI**
- Click the "Upload Files" button
- Drag & drop files or click to browse
- Files are automatically indexed

**Method 2: Add to documents folder**
- Copy files directly to the `documents/` folder
- The file watcher automatically detects and indexes them
- Organize in subfolders for project categorization

### 2. Searching Documents

1. Enter search terms in the search bar
2. Results show instantly with relevance scoring
3. Each result displays:
   - Filename and path
   - Content preview
   - Metadata (date, size, team, project)
   - Categories/tags
   - Download and view options

### 3. Using Filters

- **File Type**: Filter by document format
- **Category**: Filter by marketing activity type
- **Project**: Filter by project name (from folder structure)
- **Team**: Filter by assigned team
- **Date Range**: Filter by modification date

### 4. Organizing Documents

**Best Practices:**
- Use descriptive filenames
- Organize in folders by project: `documents/Project-Name/`
- Include team names in folder structure
- Use consistent naming conventions

**Example Structure:**
```
documents/
├── Campaign-2024-Spring/
│   ├── social-media-posts.docx
│   ├── email-templates.pdf
│   └── brand-guidelines.pdf
├── Product-Launch-XYZ/
│   ├── press-release.docx
│   ├── product-specs.pdf
│   └── launch-timeline.md
└── Analytics-Reports/
    ├── Q1-performance.pdf
    └── competitor-analysis.docx
```

## 🔧 API Endpoints

### Search
```
GET /api/search?q=query&extension=.pdf&category=Brand&project=Launch
```

### Get Filters
```
GET /api/search/filters
```

### Get Statistics
```
GET /api/search/stats
```

### Upload Files
```
POST /api/upload
Content-Type: multipart/form-data
```

### List All Documents
```
GET /api/documents
```

### Get Document by ID
```
GET /api/documents/:id
```

## 🎨 Customization

### Adding New Categories
Edit `server/services/documentCategorizer.js`:
```javascript
this.categoryKeywords = {
  'Your Category': ['keyword1', 'keyword2', 'keyword3'],
  // ... add more categories
};
```

### Adding Team Keywords
```javascript
this.teamKeywords = {
  'Your Team': ['keyword1', 'keyword2'],
  // ... add more teams
};
```

### Supported File Types
Edit `server/services/documentIndexer.js`:
```javascript
isSupportedFile(filename) {
  const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.html', '.pptx'];
  // Add more extensions
}
```

## 🛠️ Technology Stack

**Backend:**
- Express.js - Web framework
- Lunr.js - Full-text search engine
- pdf-parse - PDF extraction
- mammoth - DOCX extraction
- natural - NLP for categorization
- chokidar - File system watching
- multer - File upload handling

**Frontend:**
- React - UI framework
- Axios - HTTP client
- lucide-react - Icon library

## 📝 Notes

- First-time indexing may take a few minutes depending on document count
- Search index is saved to disk for faster subsequent startups
- File watcher automatically updates the index when files change
- Maximum upload size: 50MB per file
- Up to 10 files can be uploaded simultaneously

## 🚀 Production Deployment

For production deployment:

1. Build the React app:
```bash
cd client
npm run build
```

2. Serve the built files with Express:
```javascript
// Add to server/index.js
app.use(express.static(path.join(__dirname, '../client/build')));
```

3. Set environment variables:
```
NODE_ENV=production
PORT=80
```

## 🤝 Contributing

Feel free to customize and extend this tool for your team's needs!

## 📄 License

MIT License - feel free to use for your organization.

---

**Built with ❤️ for marketing teams who need to find information fast!**
