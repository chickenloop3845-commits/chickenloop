# ⚡ Quick Deploy Guide

**Updated:** November 29, 2025

---

## Already Deployed?

The app is live at: **https://cl1-ashen.vercel.app**

To push updates:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel auto-deploys on push. ✅

---

## First-Time Setup (5 minutes)

### Option 1: Via Website (Recommended)

1. **Go to Vercel**: https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** repository: `chickenloop3845-commits/chickenloop`
4. **Click "Deploy"** (auto-detects Next.js)
5. **Add Environment Variables** after deploy:
   - Settings → Environment Variables
   - Add `MONGODB_URI` = your MongoDB connection string
   - Add `JWT_SECRET` = `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`
6. **Redeploy** from Deployments tab

### Option 2: Via CLI

```bash
# 1. Install Vercel CLI (if needed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Add env vars in dashboard, then redeploy
```

---

## MongoDB Setup (If Needed)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0 tier)
3. Create database user (save credentials!)
4. Network Access → Add IP: `0.0.0.0/0`
5. Get connection string:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/chickenloop
   ```
6. Add to Vercel as `MONGODB_URI`

---

## Test Your Deployment

1. Visit https://cl1-ashen.vercel.app
2. Login with: `rooster@chickenloop.com` / `Chicken!123`
3. Create a job listing or CV
4. 🎉 Done!

---

## Quick Links

| Resource | URL |
|----------|-----|
| Live App | https://cl1-ashen.vercel.app |
| Vercel Dashboard | https://vercel.com/chickenloop3845-commits-projects/cl1 |
| GitHub Repo | https://github.com/chickenloop3845-commits/chickenloop |
| MongoDB Atlas | https://cloud.mongodb.com |
