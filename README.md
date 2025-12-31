# ChickenLoop - Watersports Job Platform

A full-stack job board platform specifically designed for the watersports industry. Built with Next.js, MongoDB, and JWT authentication.

## Features

### User Roles

1. **Job Seeker**
   - Create, edit, and delete CVs
   - Browse all available job listings
   - Cannot see other users' CVs

2. **Recruiter**
   - Post job listings
   - View, edit, and delete their own job postings
   - Cannot create CVs

3. **Admin**
   - View all users and their data
   - Edit any user's information
   - Delete users and their associated data

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chickenloop3845-commits/chickenloop.git
cd chickenloop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/chickenloop
JWT_SECRET=your-secret-key-change-in-production
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token  # Optional for local dev - get from Vercel dashboard

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here  # Get from https://resend.com/api-keys
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to onboarding@resend.dev
CONTACT_EMAIL=hello@chickenloop.com  # Optional, contact form recipient email
```

**Note:** For local development, image uploads require a Vercel Blob Storage token. You can get one from your Vercel dashboard under Settings → Storage → Blob. For production deployments on Vercel, this token is automatically available.

**👥 Working with a Team?**
If you're working with a team that shares the same database, see [`COWORKER_SETUP.md`](./COWORKER_SETUP.md) for setup instructions. Get your database credentials from your team lead.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cl1/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── jobs/         # Job CRUD operations
│   │   ├── cv/           # CV CRUD operations
│   │   └── admin/        # Admin user management
│   ├── admin/            # Admin dashboard pages
│   ├── recruiter/        # Recruiter dashboard pages
│   ├── job-seeker/       # Job seeker dashboard pages
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── components/       # Reusable components
├── lib/                  # Utility functions
│   ├── api.ts           # API client functions
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # MongoDB connection
│   └── jwt.ts           # JWT utilities
├── models/              # Mongoose models
│   ├── User.ts
│   ├── Job.ts
│   └── CV.ts
└── contexts/            # React contexts
    └── AuthContext.tsx
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (authenticated users)
- `GET /api/jobs/my` - Get recruiter's own jobs
- `GET /api/jobs/[id]` - Get a single job
- `POST /api/jobs` - Create a job (recruiters only)
- `PUT /api/jobs/[id]` - Update a job (recruiters, own jobs only)
- `DELETE /api/jobs/[id]` - Delete a job (recruiters, own jobs only)

### CV
- `GET /api/cv` - Get current user's CV (job seekers only)
- `POST /api/cv` - Create CV (job seekers only)
- `PUT /api/cv` - Update CV (job seekers only)
- `DELETE /api/cv` - Delete CV (job seekers only)

### Admin
- `GET /api/admin/users` - Get all users with data (admin only)
- `GET /api/admin/users/[id]` - Get a single user (admin only)
- `PUT /api/admin/users/[id]` - Update a user (admin only)
- `DELETE /api/admin/users/[id]` - Delete a user (admin only)

## Usage

1. **Register**: Create an account as either a job seeker or recruiter
2. **Job Seekers**: Create your CV and browse available jobs
3. **Recruiters**: Post job listings and manage them
4. **Admins**: Manage all users and their data

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Contributing

This repository is a fork of [chickenloop3845-commits/chickenloop](https://github.com/chickenloop3845-commits/chickenloop). 

To contribute changes back to the upstream repository:
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines
- Use the helper script: `./create-upstream-pr.sh`

### Branch Verification

If you encounter issues accessing a branch or need to verify branch existence:

```bash
# Verify repository access and list all branches
./scripts/verify-branch-access.sh

# Check if a specific branch exists
./scripts/verify-branch-access.sh "branch-name"
```

For detailed troubleshooting, see [BRANCH_VERIFICATION.md](./BRANCH_VERIFICATION.md).

## License

This project is open source and available under the MIT License.
