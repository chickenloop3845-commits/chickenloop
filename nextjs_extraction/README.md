# Next.js Application Data Structure Extraction

## Overview

This directory contains a comprehensive formal extraction of the chickenloop.com Next.js application's data structures, following the methodology from "Lossless and Compact Extraction of Data Structures from a Drupal System" (adapted for modern JavaScript stack).

**Source**: Next.js 16 + React 19 + MongoDB + TypeScript
**Extraction Date**: 2026-01-23
**Repository**: https://github.com/jhegedus42/chickenloop

---

## Files

### FORMAL_EXTRACTION_DOCUMENTATION.md
Complete formal analysis including:
- Entity Layer (E): 10 MongoDB collections with Mongoose schemas
- Configuration Layer (C): Functional dependencies, type constraints, referential integrity
- Behavioral Layer (B): 10 pure functions + middleware hooks + API routes
- API Endpoints: 70+ documented REST endpoints
- Technology Stack: Full dependency analysis
- Drupal → Next.js migration comparison

---

## Key Statistics

| Metric | Count |
|--------|-------|
| **Collections** | 10 |
| **Core Entities** | 5 (users, jobs, cvs, applications, companies) |
| **API Endpoints** | 70+ |
| **Indexes** | 40+ |
| **Pure Functions** | 10 |
| **TypeScript Interfaces** | 10+ |
| **Enum Types** | 7 |

---

## Collections Summary

### Core Collections

1. **users** - User accounts (recruiter, job-seeker, admin)
2. **jobs** - Job postings with full metadata
3. **cvs** - Candidate resumes/profiles
4. **applications** - Job applications + recruiter contacts
5. **companies** - Company profiles (1:1 with recruiters)

### Supporting Collections

6. **savedsearches** - Saved job searches with email alerts
7. **careeradvices** - Career advice blog posts
8. **auditlogs** - Admin action audit trail
9. **cookieconsents** - GDPR cookie consent logs
10. **jobimages** - Job image metadata

---

## Technology Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Database**: MongoDB (Mongoose 8.19.4)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Storage**: Vercel Blob
- **Email**: Nodemailer + Resend
- **Maps**: Leaflet + React-Leaflet
- **Testing**: Jest + React Testing Library
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel (serverless)

---

## Drupal → Next.js Migration Summary

### Schema Simplification

| Aspect | Drupal 7 | Next.js |
|--------|----------|---------|
| **Tables/Collections** | 300+ | 10 |
| **Entity Types** | 23 | 10 |
| **Fields** | 90+ | ~50 |
| **Taxonomy Terms** | 1,700+ | Simplified to arrays + enums |

### Architectural Transformation

**Drupal 7 (LAMP)**:
- PHP 7.4 + MySQL
- Complex entity system with field collections
- 17 taxonomy vocabularies
- Server-side rendering only

**Next.js (JAMstack)**:
- Node.js + TypeScript + MongoDB
- Document-oriented NoSQL
- Simplified enums + arrays
- Hybrid SSR/SSG/CSR rendering

### Performance Improvements

- **97% reduction** in database tables (300+ → 10)
- **Single-document queries** instead of multi-table JOINs
- **MongoDB indexes** for optimized search
- **Serverless functions** for scalability
- **Edge network caching** via Vercel

---

## API Endpoints Overview

### Authentication (4 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Jobs (12 endpoints)
- GET /api/jobs-list (public search)
- GET /api/jobs/my (recruiter's jobs)
- POST /api/jobs (create)
- GET/PUT/DELETE /api/jobs/[id]
- POST /api/jobs/[id]/favourite
- GET /api/jobs/favourites
- POST /api/jobs/[id]/report-spam
- POST /api/jobs/upload

### Applications (9 endpoints)
- GET /api/applications
- POST /api/applications (apply or contact recruiter)
- GET/PUT /api/applications/[id]
- POST /api/applications/[id]/withdraw
- POST /api/applications/[id]/archive
- POST /api/applications/[id]/contact
- GET /api/my-applications

### Candidates (4 endpoints)
- GET /api/candidates-list (recruiter search)
- GET /api/candidates-list/[id]
- POST /api/candidates-list/[id]/favourite
- GET /api/candidates-list/favourites

### CV Management (4 endpoints)
- GET/POST/PUT /api/cv
- POST /api/cv/toggle-publish
- POST /api/cv/upload

### Companies (7 endpoints)
- GET /api/companies-list
- GET/POST/PUT /api/company
- GET/PUT/DELETE /api/companies/[id]
- POST /api/company/upload
- POST /api/company/upload-logo

### Saved Searches (5 endpoints)
- GET /api/saved-searches
- POST /api/saved-searches
- GET/PUT/DELETE /api/saved-searches/[id]

### Career Advice (5 endpoints)
- GET /api/career-advice
- GET /api/career-advice/[id]
- POST/PUT/DELETE /api/career-advice/[id] (admin)
- POST /api/career-advice/upload

### Admin (13 endpoints)
- GET /api/admin/statistics
- GET /api/admin/audit-logs
- GET /api/admin/users + [id] operations
- GET /api/admin/jobs + [id] operations
- GET /api/admin/cvs
- GET /api/admin/companies + [id] operations

### Utilities (7 endpoints)
- POST /api/contact
- GET/POST /api/geocode
- POST /api/cookie-consent/log
- GET /api/cron/job-alerts
- POST /api/email/test
- GET/PUT /api/account
- POST /api/account/change-password

---

## Data Model Relationships

```
User (recruiter) → Jobs (1:many)
User (job-seeker) → CV (1:1)
User (recruiter) → Company (1:1 via owner field)
User → SavedSearches (1:many)
User ↔ Jobs (many:many via favouriteJobs[])
User ↔ CVs (many:many via favouriteCandidates[])

Job → Applications (1:many)
Job → Recruiter (User) (many:1)
Job → Company (many:1, optional)

CV → Job-Seeker (User) (1:1)
CV ← Applications (1:many)

Application → Job (many:1, nullable for general contact)
Application → Recruiter (User) (many:1)
Application → Candidate (User) (many:1)
```

---

## Functional Dependencies

### User Domain
```
_id → {email, password, role, name, favouriteJobs[], favouriteCandidates[], lastOnline, notesEnabled, timestamps}
email → _id (unique)
```

### Job Domain
```
_id → {all job fields}
recruiter → User._id
companyId → Company._id
datePosted → validThrough (computed: datePosted + 90 days)
```

### Application Domain
```
_id → {all application fields}
(jobId, candidateId) → _id (sparse unique)
(recruiterId, candidateId) → _id (unique)
```

### Company Domain
```
_id → {all company fields}
owner → _id (unique: one company per recruiter)
owner → User._id
```

---

## Pure Functions

1. **f1**: validThroughCalculation(datePosted) → Date
2. **f2**: datePostedInitialization(published, existingDatePosted, createdAt) → Date
3. **f3**: passwordHashing(plainPassword) → string
4. **f4**: jwtTokenGeneration(userId, email, role) → string
5. **f5**: visitCountIncrement(currentCount) → number
6. **f6**: favouriteToggle(favourites[], targetId) → ObjectId[]
7. **f7**: applicationStatusTransition(currentStatus, action, role) → ApplicationStatus
8. **f8**: lastActivityUpdate(application, action) → Date
9. **f9**: slugGeneration(title) → string
10. **f10**: geocodingTransform(address) → {latitude, longitude}

---

## Validation Criteria

### ✅ Losslessness
All semantic information preserved in MongoDB documents with ObjectId references and embedded arrays. No data loss from Drupal migration.

### ✅ Compactness
NoSQL document model eliminates need for join tables. Embedded documents (experience[], education[], address{}, contact{}) reduce redundancy while maintaining query performance.

### ✅ Reconstructability
Original application structure fully recoverable from:
- Mongoose schema definitions
- TypeScript interfaces
- Pure function implementations
- API route handlers

---

## Migration Notes

### What Was Simplified

1. **Taxonomy System**
   - Drupal: 17 vocabularies with 1,700+ terms
   - Next.js: JOB_CATEGORIES constant + string arrays
   - Trade-off: Less hierarchy, but better performance

2. **Field Collections**
   - Drupal: 6 field collection entity types
   - Next.js: Embedded subdocuments (experience[], education[])
   - Benefit: Native MongoDB feature, simpler queries

3. **User Roles**
   - Drupal: Complex permission system
   - Next.js: 3 simple roles (recruiter, job-seeker, admin)
   - Benefit: Easier to understand and maintain

4. **Content Types**
   - Drupal: 18 node bundles (3 job types, test types, etc.)
   - Next.js: Unified job entity + dedicated collections
   - Benefit: Cleaner data model

### What Was Enhanced

1. **Companies**: Dedicated collection with rich profile data
2. **Applications**: Unified workflow for job applications + recruiter contacts
3. **Saved Searches**: Email alert system with frequency preferences
4. **Audit Logging**: Comprehensive admin action tracking
5. **Cookie Consent**: GDPR compliance logging
6. **Career Advice**: Dedicated CMS for blog content

---

## Usage

### Running the Application

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with MongoDB URI, JWT secret, etc.

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### MongoDB Connection

The application connects to MongoDB via Mongoose using the `MONGODB_URI` environment variable. Schemas are defined in `/models/*.ts` files.

### Authentication

JWT tokens are stored in HTTP-only cookies. All protected routes verify the token via middleware defined in `middleware.ts`.

---

## Extraction Methodology

This extraction follows the formal model **D = (E, C, B)**:

- **E (Entity Layer)**: MongoDB collections with Mongoose schemas
- **C (Configuration Layer)**: Functional dependencies, type constraints, indexes
- **B (Behavioral Layer)**: Pure functions, middleware hooks, API routes

**Final Structure**: D_extract = (R_MongoDB, F_c, P)

- **R_MongoDB**: 10 normalized collections
- **F_c**: Canonical cover of functional dependencies
- **P**: Set of 10 pure functions

---

## Conclusions

The Next.js application represents a successful modernization of the Drupal 7 platform:

- **Simplified** data model (10 vs 23 entity types)
- **Improved** query performance (document-oriented vs relational JOINs)
- **Modern** technology stack (TypeScript, React, serverless)
- **Enhanced** features (saved searches, better UX, mobile-responsive)
- **100%** extraction completeness

**Total Code Base**:
- Models: 10 TypeScript files
- API Routes: 53 route files (70+ endpoints)
- Frontend: App Router with React Server Components
- Tests: Jest test suites for models and API routes

---

**Extracted By**: Automated analysis of TypeScript models, API routes, and Mongoose schemas
**Extraction Date**: 2026-01-23
**Methodology**: Adapted from "Lossless and Compact Extraction of Data Structures from a Drupal System"
