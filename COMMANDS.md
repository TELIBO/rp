# 🎯 Available Commands

## Quick Commands

### Start Everything (Recommended)
```bash
npm run dev
```
**What it does:**
- Starts backend server on port 5000
- Starts React dev server on port 3000
- Runs both concurrently
- Opens browser automatically

**Use this when:** You want to run the full application

---

### Backend Only
```bash
npm run server
```
**What it does:**
- Starts Express server on port 5000
- Runs with nodemon (auto-restart on changes)
- Indexes documents
- Starts file watcher
- Serves API endpoints

**Use this when:** You're working on backend code or testing APIs

---

### Frontend Only
```bash
npm run client
```
**What it does:**
- Changes to client directory
- Starts React dev server on port 3000
- Enables hot reload
- Opens browser

**Use this when:** Backend is already running and you're working on UI

---

## Installation Commands

### Install All Dependencies
```bash
npm run install-all
```
**What it does:**
- Installs backend dependencies
- Changes to client directory
- Installs frontend dependencies

**Use this when:** First time setup or after pulling code

---

### Install Backend Only
```bash
npm install
```
**What it does:**
- Installs packages from root package.json
- Includes Express, Lunr, parsers, etc.

---

### Install Frontend Only
```bash
cd client
npm install
```
**What it does:**
- Installs React and dependencies
- Includes axios, lucide-react, etc.

---

## Build Commands

### Build for Production
```bash
npm run build
```
**What it does:**
- Changes to client directory
- Creates optimized production build
- Outputs to client/build folder
- Minifies code
- Optimizes assets

**Use this when:** Preparing for deployment

---

## Development Workflow

### Initial Setup
```bash
# 1. Install dependencies
npm run install-all

# 2. Start development
npm run dev
```

### Daily Development
```bash
# Start the app
npm run dev

# Open http://localhost:3000
# Backend runs on http://localhost:5000
```

### Backend Development
```bash
# Terminal 1: Backend with auto-reload
npm run server

# Terminal 2: Frontend
npm run client
```

### Frontend Development
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend with hot reload
cd client
npm start
```

---

## Testing Commands

### Test Backend API
```bash
# Start backend
npm run server

# In another terminal, test endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/search/stats
curl "http://localhost:5000/api/search?q=test"
```

### Test Frontend
```bash
# Start frontend only
cd client
npm start

# Backend must be running separately
```

---

## Troubleshooting Commands

### Clear Node Modules
```bash
# Root
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Client
cd client
Remove-Item -Path "node_modules" -Recurse -Force
npm install
```

### Clear Index Cache
```bash
Remove-Item -Path "index" -Recurse -Force -ErrorAction SilentlyContinue
```

### Reset Everything
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Clear caches
Remove-Item -Path "index" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall
npm run install-all

# Start fresh
npm run dev
```

---

## Environment Commands

### View Environment
```bash
cat .env
```

### Edit Environment
```bash
notepad .env
```

### Reset to Default
```bash
copy .env.example .env
```

---

## File Management Commands

### List Documents
```bash
Get-ChildItem -Path "documents" -Recurse
```

### Add Sample Document
```bash
echo "Test content" > documents/test.txt
```

### Clear All Documents
```bash
Remove-Item -Path "documents\*" -Recurse -Force
```

---

## Port Commands

### Check What's Running on Port
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Kill Process on Port
```bash
# Get PID from netstat above, then:
taskkill /F /PID <process_id>
```

---

## Package Management

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all
npm update

# Update client
cd client
npm update
```

### Add New Package
```bash
# Backend
npm install package-name

# Frontend
cd client
npm install package-name
```

---

## Git Commands (If Using Version Control)

### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Marketing Knowledge Hub"
```

### Check Status
```bash
git status
git log
```

---

## Production Commands

### Build and Serve
```bash
# Build frontend
npm run build

# Serve with backend
# (Add static serving to server/index.js)
NODE_ENV=production npm start
```

---

## Monitoring Commands

### Watch Logs
```bash
# Backend logs
npm run server
# Watch console for:
# - Document indexing
# - File changes
# - API requests

# Frontend logs
npm run client
# Watch browser console
```

### Check Health
```bash
# API health
curl http://localhost:5000/api/health

# Get stats
curl http://localhost:5000/api/search/stats
```

---

## Quick Reference

| Command | What It Does | When To Use |
|---------|-------------|-------------|
| `npm run dev` | Start everything | Main development |
| `npm run server` | Backend only | API development |
| `npm run client` | Frontend only | UI development |
| `npm run build` | Production build | Deployment prep |
| `npm run install-all` | Install all deps | First setup |

---

## Common Workflows

### First Time Setup
```bash
npm run install-all
npm run dev
# Open http://localhost:3000
```

### Start Working
```bash
npm run dev
# Make changes
# See updates automatically
```

### Backend Changes
```bash
npm run server
# Edit files in server/
# Nodemon restarts automatically
```

### Frontend Changes
```bash
npm run dev
# Edit files in client/src/
# Hot reload updates browser
```

### Test Search
```bash
npm run dev
# Wait for indexing
# Search in UI
# Or use curl for API
```

### Deploy
```bash
npm run build
# Deploy client/build and server/
# Set environment variables
# Start production server
```

---

**Pro Tip:** Keep `npm run dev` running and just code! Hot reload handles the rest. 🚀
