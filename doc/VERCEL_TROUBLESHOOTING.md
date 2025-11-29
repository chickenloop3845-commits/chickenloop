# 🚨 Vercel Deployment Troubleshooting

**Updated:** November 29, 2025

Quick reference for fixing common Vercel deployment issues.

**Live URL:** https://cl1-ashen.vercel.app

## Quick Status Check

```bash
# List recent deployments
vercel ls

# Check latest deployment logs
vercel inspect $(vercel ls --limit 1 | tail -1 | awk '{print $2}') --logs
```

## Common Errors & Fixes

### 1. Build Failed - TypeScript Errors

**Error:**
```
Failed to compile.
Type error: ...
```

**Fix:**
```bash
# Test build locally first
npm run build

# Fix TypeScript errors
# Common fixes:
# - Add type assertions: `value as Type`
# - Add null checks: `value?.property`
# - Fix import statements
# - Update type definitions

# Then commit and push
git add .
git commit -m "Fix TypeScript errors"
git push
```

### 2. Build Failed - Module Not Found

**Error:**
```
Module not found: Can't resolve 'package-name'
```

**Fix:**
```bash
# Install missing package
npm install package-name

# Commit changes
git add package.json package-lock.json
git commit -m "Add missing dependency: package-name"
git push
```

### 3. Build Failed - Environment Variables Missing

**Error:**
```
Error: Missing required environment variable: MONGODB_URI
```

**Fix:**
```bash
# Add environment variable via CLI
vercel env add MONGODB_URI production
# Enter value when prompted

# Or via Dashboard:
# Project Settings → Environment Variables → Add
```

**Required variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key

### 4. Deployment Hangs / Timeout

**Symptoms:**
- Build starts but never completes
- Deployment shows "Building..." for >10 minutes

**Fix:**
```bash
# Check build logs for specific error
vercel inspect <deployment-url> --logs

# Common causes:
# 1. Large files in repo - check .gitignore
# 2. Slow npm install - check package.json
# 3. TypeScript compilation taking too long
# 4. Missing dependencies causing retries
```

### 5. Runtime Error - MongoDB Connection Failed

**Error:**
```
MongooseError: Could not connect to MongoDB Atlas
```

**Fix:**
1. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow all IPs) for Vercel
   - Or add Vercel IP ranges

2. **Verify Connection String:**
   ```bash
   # Check environment variable
   vercel env ls
   
   # Format should be:
   # mongodb+srv://username:password@cluster.mongodb.net/chickenloop
   ```

3. **Test Connection:**
   ```bash
   # Use mongosh or MongoDB Compass to test
   mongosh "your-connection-string"
   ```

### 6. Runtime Error - JWT Secret Missing

**Error:**
```
Error: JWT_SECRET is not defined
```

**Fix:**
```bash
# Add JWT_SECRET
vercel env add JWT_SECRET production

# Generate a secure secret:
openssl rand -base64 32
```

### 7. Build Succeeds but Site Shows Error

**Check:**
1. **View deployment logs:**
   ```bash
   vercel inspect <deployment-url> --logs
   ```

2. **Check runtime logs:**
   - Vercel Dashboard → Project → Deployments → Select deployment → Logs

3. **Common issues:**
   - Environment variables not set for production
   - API routes returning errors
   - Database connection issues

## Deployment Workflow

### Before Pushing

```bash
# 1. Test build locally
npm run build

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Test locally
npm run dev
# Visit http://localhost:3000 and test features

# 4. Commit and push
git add .
git commit -m "Description"
git push origin main
```

### After Pushing

```bash
# 1. Wait 10-30 seconds for Vercel to detect push

# 2. Check deployment status
vercel ls

# 3. Monitor build
vercel inspect <deployment-url> --logs

# 4. Test deployed site
# URL shown in: vercel ls output
```

## Useful Vercel Commands

```bash
# List all deployments
vercel ls

# View specific deployment
vercel inspect <deployment-url>

# View deployment logs
vercel inspect <deployment-url> --logs

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME production

# Remove environment variable
vercel env rm VARIABLE_NAME production

# View project info
vercel project ls
```

## Vercel Dashboard Links

- **Dashboard**: https://vercel.com/dashboard
- **Project**: https://vercel.com/chickenloop3845-commits-projects/cl1
- **Deployments**: Check in dashboard for full history

## Quick Fixes Checklist

When deployment fails:

- [ ] Run `npm run build` locally - does it work?
- [ ] Check TypeScript errors: `npx tsc --noEmit`
- [ ] Verify environment variables: `vercel env ls`
- [ ] Check MongoDB Atlas IP whitelist
- [ ] Review build logs: `vercel inspect <url> --logs`
- [ ] Check for missing dependencies
- [ ] Verify `.gitignore` excludes large files
- [ ] Test API routes locally
- [ ] Check recent commits for breaking changes

## Getting Help

1. **Check logs first:**
   ```bash
   vercel inspect <deployment-url> --logs | tail -50
   ```

2. **Search error message** in this guide or project docs

3. **Check recent commits:**
   ```bash
   git log --oneline -10
   ```

4. **Review project documentation:**
   - [`COLLABORATOR_GUIDE.md`](./COLLABORATOR_GUIDE.md)
   - [`DEPLOYMENT.md`](./DEPLOYMENT.md)
   - [`README.md`](./README.md)

---

**Remember:** Always test locally before pushing! 🚀

