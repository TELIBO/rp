# 🚀 Quick Railway Deployment

## Step-by-Step (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy on Railway
1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `rp` repository
5. Click "Deploy"

### 3. Add Database
1. In project, click "+ New" → "Database" → "PostgreSQL"
2. Railway auto-connects it (DATABASE_URL is set automatically)

### 4. Configure Environment Variables
Click your service → "Variables" tab → Add:
```
DOCUMENTS_PATH=./documents-demo
INDEX_PATH=./index
NODE_ENV=production
```

### 5. Done! 🎉
- Your app is live at: `your-project.railway.app`
- Share this URL with hackathon judges
- No private documents are deployed (protected by .gitignore)

---

## What Gets Deployed?
✅ Application code
✅ Demo documents (`documents-demo/`)
✅ PostgreSQL database
❌ Your private `documents/` folder
❌ `.env` file
❌ `node_modules/`

## Troubleshooting
If app doesn't start:
- Check "Deployments" tab for logs
- Verify DATABASE_URL is set (should be automatic with PostgreSQL)
- Wait 2-3 minutes for initial deployment

## Free Tier
- $5/month credit (plenty for hackathon)
- No credit card needed
- Auto-scales

Good luck with your hackathon! 🏆
