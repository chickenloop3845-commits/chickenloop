# Deployment Guide for ChickenLoop

**Updated:** November 29, 2025

This guide covers deploying ChickenLoop to Vercel with MongoDB Atlas.

---

## Current Deployment

| Item | Value |
|------|-------|
| **Production URL** | https://cl1-ashen.vercel.app |
| **GitHub Repository** | https://github.com/chickenloop3845-commits/chickenloop |
| **Vercel Project** | cl1 |
| **Database** | MongoDB Atlas (Cluster042369) |
| **Region** | US East (iad1) |

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account
- MongoDB Atlas account (free tier works)

---

## Step 1: MongoDB Atlas Setup

### Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (M0 free tier)

### Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Create username and password (save these!)
4. Set permissions: **Read and write to any database**

### Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Required for Vercel's dynamic IPs

### Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Add database name at the end:

```
mongodb+srv://username:password@cluster.mongodb.net/chickenloop
```

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Website (Recommended)

1. Push code to GitHub (if not already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click **Add New Project**

4. Import your GitHub repository

5. Vercel auto-detects Next.js - click **Deploy**

### Option B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

---

## Step 3: Configure Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret (32+ characters) |

### Via Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
   - Environments: ✅ Production ✅ Preview ✅ Development
4. Repeat for `JWT_SECRET`
5. Click **Save**
6. **Redeploy**: Go to Deployments → "..." → Redeploy

### Via CLI

```bash
# Add variables
vercel env add MONGODB_URI production preview development
vercel env add JWT_SECRET production preview development

# Verify
vercel env ls

# Redeploy
vercel --prod
```

### Generate JWT Secret

```bash
openssl rand -base64 32
```

Or use: `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`

---

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Register a new account
3. Test creating jobs/CVs
4. Check that images upload correctly (Vercel Blob)

---

## Continuous Deployment

After initial setup, Vercel automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main
# Vercel auto-deploys in ~30-60 seconds
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `BLOB_READ_WRITE_TOKEN` | Auto | Vercel Blob storage (auto-injected) |

---

## Troubleshooting

### Build Fails

```bash
# Test locally first
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### MongoDB Connection Errors

1. Verify IP whitelist includes `0.0.0.0/0`
2. Check username/password in connection string
3. Ensure database name is appended: `/chickenloop`

### Environment Variables Not Working

1. Verify all environments are checked (Production, Preview, Development)
2. Redeploy after adding variables

### 500 Errors in Production

```bash
# Check deployment logs
vercel inspect <deployment-url> --logs
```

---

## Alternative Hosting Options

### Railway
1. Go to [Railway](https://railway.app)
2. Create project from GitHub
3. Add MongoDB service or use Atlas
4. Set environment variables
5. Deploy

### Render
1. Go to [Render](https://render.com)
2. Create Web Service from GitHub
3. Set environment variables
4. Deploy

---

## Useful Commands

```bash
# Vercel CLI
vercel                    # Deploy preview
vercel --prod             # Deploy production
vercel ls                 # List deployments
vercel inspect <url>      # Inspect deployment
vercel inspect <url> --logs # View logs
vercel env ls             # List env vars
vercel env add NAME       # Add env var
vercel env rm NAME        # Remove env var

# Local development
npm run dev               # Start dev server
npm run build             # Build for production
npm start                 # Start production server
npm run lint              # Run linter
```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Next.js Documentation](https://nextjs.org/docs)
- Project docs: See `doc/` folder
