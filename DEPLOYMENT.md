# Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Your code pushed to GitHub

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `rp` repository
5. Railway will auto-detect and deploy

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a database and set `DATABASE_URL` automatically

## Step 4: Set Environment Variables

In Railway dashboard, go to your service → Variables tab, add:

```
PORT=5000
NODE_ENV=production
DOCUMENTS_PATH=./documents-demo
INDEX_PATH=./index
```

Optional (if using):
```
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_key
OPENAI_API_KEY=your_key
```

## Step 5: Initial Setup

After deployment, your app will:
- Automatically create PostgreSQL tables
- Index documents from `documents-demo` folder
- Be available at `your-app.railway.app`

## Important Notes

✅ Your private `documents/` folder is NOT deployed (protected by .gitignore)
✅ Only demo documents in `documents-demo/` will be indexed
✅ Environment variables are secure in Railway

## Testing

1. Visit your Railway URL
2. Test search functionality
3. Upload demo documents via UI
4. Share URL with hackathon judges!

## Troubleshooting

**If deployment fails:**
- Check Railway logs in dashboard
- Verify all environment variables are set
- Ensure PostgreSQL database is connected

**If documents don't appear:**
- Railway will auto-index on startup
- Check logs for indexing progress
- May take 1-2 minutes for initial indexing

## Cost

- Railway Free Tier: $5 credit/month (enough for hackathon)
- PostgreSQL: Included in free tier
- No credit card required for trial

## Post-Hackathon

To save costs after hackathon:
- Pause or delete the Railway project
- Keep your code on GitHub
- Can redeploy anytime for free
