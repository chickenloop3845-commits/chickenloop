# 🔄 Vercel Environment Sync Guide

**Updated:** November 29, 2025

Sync environment variables between local development and Vercel.

---

## Current Configuration

| Environment | Value |
|-------------|-------|
| **Vercel Project** | cl1 |
| **Production URL** | https://cl1-ashen.vercel.app |
| **Dashboard** | https://vercel.com/chickenloop3845-commits-projects/cl1 |

---

## Quick Sync Commands

### Step 1: Login to Vercel

```bash
vercel login
```

This opens your browser for authentication.

### Step 2: Link Project (if needed)

```bash
cd /path/to/chickenloop
vercel link
```

### Step 3: Sync Environment Variables

#### Via CLI

```bash
# List current variables
vercel env ls

# Add/update variables
vercel env add MONGODB_URI production preview development
vercel env add JWT_SECRET production preview development

# Remove old variables
vercel env rm MONGODB_URI production
vercel env rm MONGODB_URI preview
vercel env rm MONGODB_URI development
```

#### Via Dashboard

1. Go to: https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables
2. Add/edit variables as needed
3. Save changes
4. Redeploy from Deployments tab

### Step 4: Trigger Redeployment

```bash
vercel --prod --force
```

Or via Dashboard: Deployments → "..." → Redeploy

---

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/chickenloop` |
| `JWT_SECRET` | JWT signing key | `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=` |

---

## Pull Environment Variables to Local

```bash
# Pull env vars to .env.local
vercel env pull .env.local
```

---

## Verify Sync

After syncing:

1. **Check variables:**
   ```bash
   vercel env ls
   ```

2. **Test deployment:**
   - Visit https://cl1-ashen.vercel.app
   - Login with test account
   - Verify database connectivity

3. **Check logs if issues:**
   ```bash
   vercel logs --prod
   ```

---

## Sync Script

For automated syncing, use the sync script:

```bash
./scripts/sync-vercel-env.sh
```

This script:
1. Verifies Vercel login
2. Removes old environment variables
3. Adds new environment variables
4. Triggers production redeployment

---

## Troubleshooting

### "No existing credentials found"

```bash
vercel login
```

### "Project not linked"

```bash
vercel link
# Select your team/project when prompted
```

### Environment variables not updating

1. Remove the old variable first
2. Add the new variable
3. Redeploy (changes require redeploy)

```bash
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI production
vercel --prod --force
```

---

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) - Fix common issues
- [SYNC_NOW.md](./SYNC_NOW.md) - Dashboard sync instructions
