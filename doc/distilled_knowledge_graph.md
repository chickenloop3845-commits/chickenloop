## Documentation Files - Structured Hierarchy

---

### 1. Project Overview & Context
- **1.1 CHAT_SUMMARY.md** — Project overview, tech stack, key features implemented
- **1.2 CONVERSATION_EXPORT.md** — Full development history, code patterns, Q&A (extends 1.1)
- **1.3 DOCS_INDEX.md** — Navigation index linking to all docs below
- **1.4 Opus4.5_at_startup.md** — AI system context explanation (meta-documentation)

---

### 2. Getting Started (New Developers)
- **2.1 SETUP_GUIDE.md** — Complete local setup with Cursor IDE
  - Prerequisites: Node.js, Git, MongoDB
  - References: 3.1 for MongoDB, 4.1 for Git
- **2.2 COLLABORATOR_GUIDE.md** — Comprehensive onboarding (combines 2.1 + 4.x + 5.x)
- **2.3 COWORKER_SETUP.md** — Quick 5-minute shared database setup
  - Requires credentials from 6.1
- **2.4 TEAM_LEAD_INSTRUCTIONS.md** — How to share access with new team members
  - References: 2.3 for coworker setup, 6.1 for credentials

---

### 3. Database (MongoDB Atlas)
- **3.1 MONGODB_SETUP.md** — Full MongoDB Atlas setup (account → cluster → connection)
- **3.2 FIND_CONNECTION_STRING.md** — How to locate your connection string
  - Follow-up to 3.1 step 4
- **3.3 FIX_MONGODB_WHITELIST.md** — Fix IP access issues
  - Troubleshooting for 3.1 network config
- **3.4 QUICK_IP_FIX.md** — 30-second whitelist fix (quick version of 3.3)
- **3.5 INVESTIGATION_REPORT.md** — Analysis of missing data due to cascade deletions
  - Documents issue caused by 3.x database operations

---

### 4. Version Control (Git & GitHub)
- **4.1 GITHUB_SSH_SETUP.md** — SSH key generation and GitHub authentication
- **4.2 GITHUB_DEPLOY.md** — Push code to GitHub, connect to Vercel
  - Prerequisites: 4.1 for authentication
- **4.3 GIT_CONFIGURATION_FIX.md** — Fix wrong author name on commits
  - Troubleshooting for 4.x operations

---

### 5. Deployment (Vercel)
- **5.1 DEPLOYMENT.md** — Complete deployment guide (Vercel + MongoDB)
  - References: 3.1 for database, 4.2 for GitHub
- **5.2 QUICK_DEPLOY.md** — 2-minute deployment (condensed 5.1)
- **5.3 DEPLOYMENT_STATUS.md** — Current deployment state and next steps
  - Status tracker for 5.1/5.2
- **5.4 VERCEL_TROUBLESHOOTING.md** — Common deployment errors and fixes
  - Troubleshooting for 5.1-5.3
- **5.5 ADD_VERCEL_COLLABORATOR.md** — Add team members to Vercel project
  - Extends 5.x for team scenarios

---

### 6. Environment & Secrets
- **6.1 PASSWORDS_AND_SECRETS.md** — Where credentials are stored, security practices
  - Referenced by: 2.3, 2.4, 5.1
- **6.2 SYNC_DATABASE.md** — Sync local `.env.local` with Vercel env vars
  - Uses values from 6.1
- **6.3 SYNC_NOW.md** — Quick sync with actual credential values
  - Shortcut for 6.2
- **6.4 QUICK_SYNC_INSTRUCTIONS.md** — Dashboard vs CLI sync methods
  - Alternative approaches to 6.2
- **6.5 VERCEL_SYNC_STEPS.md** — Step-by-step Vercel environment sync
  - Detailed version of 6.4

---

### 7. Image Storage
- **7.1 BLOB_STORAGE_MIGRATION.md** — Why and how images moved to cloud storage
  - Problem: Local filesystem doesn't persist on Vercel (see 5.4)
- **7.2 ENABLE_BLOB_STORAGE.md** — Enable Vercel Blob Storage
  - Implementation steps for 7.1

---

### 8. Automation
- **8.1 AUTO_UPDATE_MEMORY.md** — Git hook auto-updates SESSION_MEMORY.md
  - Enhances workflow in 4.x

---

## Cross-Reference Map

```
New Developer Path:
1.1 → 2.1 → 3.1 → 4.1 → 5.1

Quick Start Path:
1.1 → 2.3 → 5.2

Troubleshooting Path:
Problem with DB?     → 3.3, 3.4
Problem with deploy? → 5.4
Problem with Git?    → 4.3
Missing images?      → 7.1, 7.2

Credential Questions:
Where are passwords? → 6.1
How to sync env?     → 6.2, 6.3, 6.4
```
