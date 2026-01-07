# Session Memory - ChickenLoop Project

**Last Updated:** January 07, 2026 at 10:16 PM IST
**Last Commit By:** Tzwengali (sven.kelling@gmail.com)
**Branch:** 2026Jan01
**Project:** ChickenLoop - Watersports Job Platform  
**Repository:** https://github.com/chickenloop3845-commits/chickenloop

> **Note:** This file is automatically updated on each commit via git pre-commit hook.

## 📋 Project Overview

**ChickenLoop** is a full-stack job platform for watersports with three user roles:
- **Recruiter**: Post, view, edit, delete jobs. Manage company profile. Cannot create CV.
- **Job-seeker**: Create, edit, delete CV. Browse all jobs. Cannot see other CVs.
- **Admin**: Full access - view/edit/delete all users and their data.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Cloud) with Mongoose
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Deployment**: Vercel (auto-deploys on push to main)
- **File Storage**: Vercel Blob (cloud) for production, local filesystem for dev

---

## 📝 Session Changes

> **All session changes with deductive reasoning are stored in git commit messages.**
> 
> View with: `git log --oneline -20` or `git log -p` for full reasoning.
> 
> Commit messages follow the WHY/WHAT/HOW format defined in Coding Standards below.

---

## 🔑 Critical Configuration

### Database Setup

**MongoDB Atlas Configuration:**
- **Type**: Cloud-hosted (MongoDB Atlas)
- **Cluster**: `cluster042369.iggtazi.mongodb.net`
- **Database Name**: `chickenloop`
- **Connection String Format**: `mongodb+srv://username:password@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
- **Network Access**: 0.0.0.0/0 (allows access from anywhere)
- **Username**: `chickenloop3845_db_user`

**Important Notes:**
- ✅ Local dev server connects to MongoDB Atlas (cloud database)
- ✅ No local MongoDB installation needed
- ✅ Both local and Vercel deployments use the same database
- ✅ Database content is NOT stored in Git (never committed)

### Environment Variables

**Required in `.env.local` (local development):**
```env
MONGODB_URI=mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369
JWT_SECRET=2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=
```

**Required in Vercel (production):**
- `MONGODB_URI` - Same as local
- `JWT_SECRET` - Same as local
- `BLOB_READ_WRITE_TOKEN` - Auto-added when Blob store is created
- Set in Vercel Dashboard → Settings → Environment Variables

**Security:**
- `.env.local` is in `.gitignore` (never committed)
- `SHARED_DATABASE_CREDENTIALS.template.md` is in `.gitignore`
- Credentials must be shared securely (password manager, encrypted messaging)

---

## 👥 Team Collaboration Setup

### Repository Information

- **GitHub Repository**: https://github.com/chickenloop3845-commits/chickenloop
- **Owner**: jhegedus42 (Joco)
- **Collaborator**: Tzwengali (Sven Kelling - sven.kelling@gmail.com)

### Shared Database Access

**Setup:**
- ✅ All team members connect to the same MongoDB Atlas database
- ✅ Each developer has their own `.env.local` file
- ✅ All `.env.local` files use the same `MONGODB_URI` and `JWT_SECRET`
- ✅ Database changes are shared in real-time

**Files for Team Setup:**
- `COWORKER_SETUP.md` - Setup guide for new team members
- `TEAM_LEAD_INSTRUCTIONS.md` - Instructions for sharing credentials
- `.env.example` - Template file (safe to commit)
- `SHARED_DATABASE_CREDENTIALS.template.md` - Contains actual credentials (in .gitignore)

**To Add a New Team Member:**
1. Share `SHARED_DATABASE_CREDENTIALS.template.md` securely
2. Direct them to `COWORKER_SETUP.md`
3. They create `.env.local` with shared credentials
4. They can immediately see shared data

### Git Configuration

**Current Git User (Fixed):**
- **Name**: Tzwengali
- **Email**: sven.kelling@gmail.com
- **Scope**: Local repository configuration (fixed from Joco's settings)

**Note:**
- Global config: Tzwengali / sven.kelling@gmail.com ✅
- Local repo config: Tzwengali / sven.kelling@gmail.com ✅ (was Joco's - fixed)
- Future commits will show Tzwengali as author
- Past commits still show Joco (cannot be changed easily)

**Important:** 
- Email `sven.kelling@gmail.com` must be verified in GitHub account
- Verify at: https://github.com/settings/emails

---

## 📁 Key Files & Structure

### Database Models
- `models/User.ts` - User schema (email, password, role, name)
- `models/Job.ts` - Job schema (title, description, company, location, country, salary, type, languages, qualifications, sports, occupationalAreas, pictures)
- `models/CV.ts` - CV schema (fullName, email, phone, address, summary, experience, education, skills, certifications)
- `models/Company.ts` - Company schema (name, description, address, coordinates, website, socialMedia, owner)

### Important Utilities
- `lib/db.ts` - MongoDB connection (reads from `process.env.MONGODB_URI`)
- `lib/auth.ts` - Authentication middleware
- `lib/jwt.ts` - JWT token utilities
- `lib/countryUtils.ts` - Country name ↔ ISO code conversion (with Intl.DisplayNames fallback)
- `lib/api.ts` - Frontend API client functions
- `lib/languages.ts` - Language list
- `lib/sports.ts` - Sports/Activities list
- `lib/occupationalAreas.ts` - Occupational Areas list
- `lib/qualifications.ts` - Qualifications list

### Key Pages
- `app/jobs/[id]/page.tsx` - Job details page (with Company Info section, image gallery, lightbox)
- `app/jobs/page.tsx` - Job listing page
- `app/recruiter/jobs/new/page.tsx` - Job posting form (two-column layout)
- `app/recruiter/jobs/[id]/edit/page.tsx` - Job editing form
- `app/recruiter/company/edit/page.tsx` - Company editing form
- `app/recruiter/page.tsx` - Recruiter dashboard

### API Routes
- `app/api/jobs/route.ts` - Job CRUD (GET all, POST create)
- `app/api/jobs/[id]/route.ts` - Single job operations (GET, PUT, DELETE)
- `app/api/jobs/upload/route.ts` - Image upload handler
- `app/api/company/route.ts` - Company CRUD (POST, PUT, GET)
- `app/api/auth/*` - Authentication endpoints
- `app/api/cv/*` - CV management
- `app/api/admin/*` - Admin operations

---

## 🛡️ Coding Standards

### TypeScript Type Safety (MANDATORY)

1. **Never use `any` or `as any` casts** - Always define proper types/interfaces
2. **Never use dynamic field access** - Define all fields in interfaces
3. **Always run type checker after every modification**:
   ```bash
   npm run build
   ```
4. **Mongoose models must have complete interfaces** - All fields used in the codebase must be defined in the model's interface (e.g., `IJob`, `IUser`, etc.)

### Pre-Commit Verification

Before committing, always run:
```bash
npm run build
```

This ensures:
- TypeScript compilation passes
- No type errors
- Next.js SSR/SSG works correctly

### Commit Message Guidelines

Every commit message must include **symbolic logic-based reasoning** explaining:

1. **WHY** - The reasoning behind the change (the problem being solved)
2. **WHAT** - What was changed to solve it
3. **HOW** - The logical chain of reasoning that led to the solution

**Format:**
```
<Short summary of change>

WHY: <Problem statement / reasoning>
WHAT: <Specific changes made>
HOW: <Logical steps: A → B → C led to this solution>
```

**Example:**
```
Switch to Vercel Blob storage for image uploads

WHY: Local filesystem is ephemeral on Vercel → images disappear after deployment
WHAT: Updated 4 upload routes to use @vercel/blob put() instead of writeFile()
HOW: Ephemeral FS problem → need persistent storage → Vercel Blob is native → 
     simple put() API replaces writeFile() → URLs now point to blob.vercel-storage.com
```

---

## 🔧 Important Implementation Details

### Country Field Handling

**Storage:**
- Database stores ISO 3166-1 alpha-2 country codes (e.g., 'US', 'GB', 'FR')
- Stored in uppercase for consistency
- `null` used for empty values (not `undefined`)

**User Input:**
- Forms accept full country names in English
- `getCountryCodeFromName()` converts name → ISO code
- `getCountryNameFromCode()` converts ISO code → name (for display)

**API Handling:**
- POST/PUT routes normalize country to ISO code using `normalizeCountryForStorage()`
- GET routes return ISO code, frontend converts to name for display

### Image Upload Handling

**Storage (Production - Vercel Blob):**
- Images uploaded via `@vercel/blob` `put()` function
- URLs: `https://*.blob.vercel-storage.com/...`
- Persistent cloud storage (survives deployments)
- Blob store name: `chickenloop-blob`

**Storage (Local Development):**
- Falls back to local filesystem if BLOB_READ_WRITE_TOKEN not set
- Stored in `public/uploads/jobs/`, `public/uploads/companies/`, `public/uploads/cvs/`

**Constraints:**
- Maximum 3 pictures per job
- Maximum 5MB per image
- Allowed types: JPEG, PNG, WEBP, GIF

**Display:**
- First image: Full-width banner at top
- All images: 3-column grid below description
- Lightbox carousel for viewing all images

### Authentication & Authorization

**JWT Tokens:**
- Stored in HTTP-only cookies
- Secret: `JWT_SECRET` environment variable
- Protected routes use `requireAuth()` middleware
- Role-based access: `requireRole(['recruiter', 'admin'])`

**Public Access:**
- Registration and login pages: Public
- Job details page: Public (can view without login)
- Jobs listing: Requires authentication
- Admin routes: Admin role required

---

## 🚀 Deployment & Development

### Local Development

**Setup:**
```bash
cd chickenloop
npm install
cp .env.example .env.local
# Edit .env.local with credentials
npm run dev
```

**Server:**
- Runs on `http://localhost:3000`
- Hot-reload enabled
- Connects to MongoDB Atlas (cloud database)

### Vercel Deployment

**Auto-Deployment:**
- Pushes to `main` branch trigger automatic deployment
- Deployment takes 2-5 minutes
- Vercel project: Connected to GitHub repository

**Environment Variables:**
- Must be set in Vercel Dashboard
- Same values as `.env.local`
- Apply to all environments (Production, Preview, Development)

**Database Sync:**
- Vercel deployment uses same MongoDB Atlas database as local
- Data is shared between local and production
- Verify connection string matches in both places

---

## 📝 Important Notes & Gotchas

### Database Connection
- ✅ Local dev connects to MongoDB Atlas (cloud) - NOT local MongoDB
- ✅ No local MongoDB installation needed
- ✅ Database content never committed to Git
- ⚠️ All developers share the same database (changes are immediate)

### Git Workflow
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ User uploads (`public/uploads/`) are in `.gitignore`
- ✅ Credentials files are in `.gitignore`
- ⚠️ Never commit sensitive data

### Country Field
- Uses `null` for empty values (not `undefined`) for proper Mongoose persistence
- Forms show full country names, database stores ISO codes
- `Intl.DisplayNames` fallback implemented for environment compatibility

### Image Handling
- **Production:** Vercel Blob storage (persistent cloud)
- **Local dev:** filesystem `public/uploads/`
- Maximum 3 images per job
- Lightbox carousel for viewing images

---

## 🔐 Security Considerations

1. **Credentials:**
   - Never commit `.env.local` or credentials files
   - Share credentials via secure channels only
   - Use password managers or encrypted messaging

2. **Database:**
   - MongoDB Atlas network access set to 0.0.0.0/0 (allows from anywhere)
   - For production, consider restricting to specific IPs
   - Credentials in connection string must be kept secure

3. **Authentication:**
   - JWT tokens in HTTP-only cookies (XSS protection)
   - Passwords hashed with bcryptjs
   - Role-based access control on protected routes

---

## 📚 Documentation Files

- `README.md` - Project overview and setup
- `COWORKER_SETUP.md` - Team member onboarding guide
- `TEAM_LEAD_INSTRUCTIONS.md` - Guide for sharing database access
- `GIT_CONFIGURATION_FIX.md` - Git user configuration fix documentation
- `SESSION_MEMORY.md` - This file (comprehensive session memory)
- `CHAT_SUMMARY.md` - Development conversation summary
- `CONVERSATION_EXPORT.md` - Detailed conversation export
- `DEPLOYMENT.md` - Deployment guide
- `MONGODB_SETUP.md` - MongoDB Atlas setup instructions
- `SETUP_GUIDE.md` - Comprehensive setup guide

---

## 🎯 Current Project State

### Working Features
- ✅ User registration and authentication (3 roles)
- ✅ Job CRUD operations (recruiters)
- ✅ CV CRUD operations (job-seekers)
- ✅ Company profile management (recruiters)
- ✅ Admin user management
- ✅ Job browsing (authenticated users)
- ✅ Job details page with company info
- ✅ Image upload and gallery
- ✅ Country name/code conversion
- ✅ Multi-select fields (languages, sports, qualifications, occupational areas)

### Recent Changes (Dec 7, 2025)
- ✅ Vercel Blob storage for production image uploads
- ✅ Complete IJob TypeScript interface (no more `any` casts)
- ✅ Fixed params/searchParams null checks
- ✅ Added Suspense boundaries for useSearchParams()
- ✅ Vercel environment variables configured (MONGODB_URI, JWT_SECRET, BLOB_READ_WRITE_TOKEN)
- ✅ Added coding standards to SESSION_MEMORY.md
- ✅ Added commit message guidelines with reasoning format

---

## 🔄 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Git operations
git status
git add .
git commit -m "Message"
git push

# Check database connection
# (verify .env.local exists with MONGODB_URI)

# Verify Git user
git config --get user.name
git config --get user.email
```

---

## 💡 Quick Reference

**Database:** MongoDB Atlas (cloud)  
**Connection:** `mongodb+srv://...cluster042369.../chickenloop`  
**Local Config:** `.env.local` (not in Git)  
**Shared Credentials:** `SHARED_DATABASE_CREDENTIALS.template.md` (not in Git)  
**Repository:** https://github.com/chickenloop3845-commits/chickenloop  
**Team Members:** jhegedus42 (owner), Tzwengali (collaborator)  
**Deployment:** Vercel (auto-deploy on push to main)

---

**This file serves as a comprehensive memory of the project setup, configuration, and important details for future development sessions.**

---

## 🔄 Auto-Update System

**Automatic Updates:**
- ✅ This file is automatically updated on each commit via git pre-commit hook
- ✅ The "Last Updated" timestamp is refreshed automatically
- ✅ Git user and branch information is updated
- ✅ The file is automatically staged and included in commits

**How It Works:**
- Git pre-commit hook (`.git/hooks/pre-commit`) runs `scripts/update-memory.sh`
- Script updates the metadata at the top of this file
- File is automatically added to the commit staging area
- Commits include the updated memory file

**Installation:**
For new team members or fresh clones, run:
```bash
./scripts/install-git-hooks.sh
```

This installs the pre-commit hook that automatically updates this memory file.

**To Disable Auto-Update (if needed):**
```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

**To Re-enable:**
```bash
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```


## 🧠 Agent Rules & Preferences

### Browser Management
- **Tab Minimization**: When opening a new browser tab, check if too many tabs are open. If so, determine the minimum amount needed for the current context and close the rest. Ideally keep only essential tabs open.
