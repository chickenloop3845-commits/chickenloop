# Project Structure and Architecture

## Directory Organization

### Core Application Structure
```
cl1/
├── app/                    # Next.js App Router structure
│   ├── api/               # Backend API routes
│   ├── [role-pages]/      # Role-specific dashboard pages
│   ├── components/        # Reusable UI components
│   └── contexts/          # React context providers
├── lib/                   # Utility functions and configurations
├── models/                # MongoDB/Mongoose data models
├── public/                # Static assets and uploads
├── scripts/               # Automation and deployment scripts
└── doc/                   # Project documentation
```

### API Routes Architecture
```
app/api/
├── auth/                  # Authentication endpoints
│   ├── login/            # User login
│   ├── register/         # User registration
│   └── me/               # Current user info
├── jobs/                  # Job management
│   ├── [id]/             # Individual job operations
│   └── my/               # User's own jobs
├── cv/                    # CV management (job seekers)
├── cvs/                   # CV browsing (recruiters/admin)
├── company/               # Company profile management
├── companies/             # Company directory
├── admin/                 # Administrative operations
└── geocode/               # Location services
```

### Page Structure by User Role
```
app/
├── admin/                 # Administrator dashboard
├── recruiter/             # Recruiter dashboard
│   ├── company/          # Company management
│   └── jobs/             # Job posting management
├── job-seeker/            # Job seeker dashboard
│   └── cv/               # CV management
├── jobs/[id]/             # Public job viewing
├── cvs/[id]/              # CV viewing (role-restricted)
├── companies/[id]/        # Company profile viewing
├── login/                 # Authentication
└── register/              # User registration
```

## Core Components and Relationships

### Data Models
- **User**: Base user model with role-based permissions (job_seeker, recruiter, admin)
- **CV**: Job seeker profiles with skills, experience, and qualifications
- **Job**: Job postings with requirements and company information
- **Company**: Recruiter company profiles with location and services
- **AuditLog**: System activity tracking and compliance

### Component Architecture
- **Navbar**: Role-aware navigation with authentication state
- **DraggableMap**: Interactive location selection for jobs and companies
- **CompanyMap**: Display component for company locations
- **AuthContext**: Global authentication state management

### Authentication Flow
1. JWT-based authentication with httpOnly cookies
2. Role-based access control (RBAC) middleware
3. Protected API routes with user verification
4. Client-side route protection with context

## Architectural Patterns

### Full-Stack Next.js Architecture
- **Frontend**: React components with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing

### Data Flow Patterns
1. **Client → API → Database**: Standard CRUD operations
2. **Context → Components**: Global state management
3. **Middleware → Routes**: Authentication and authorization
4. **Models → API**: Data validation and business logic

### File Upload Strategy
- **Local Development**: File system storage in public/uploads/
- **Production**: Vercel Blob Storage integration
- **Image Processing**: Client-side optimization before upload

### Geographic Integration
- **Leaflet Maps**: Interactive mapping for location selection
- **Geocoding API**: Address to coordinates conversion
- **Location Storage**: Coordinates stored with jobs and companies

## Development Workflow

### Environment Configuration
- **Local**: .env.local with MongoDB and JWT secrets
- **Production**: Vercel environment variables
- **Team**: Shared database configuration via COWORKER_SETUP.md

### Build and Deployment
- **Development**: `npm run dev` with hot reloading
- **Production**: `npm run build` → `npm start`
- **Deployment**: Automated Vercel deployment with GitHub integration

### Code Organization Principles
- **Separation of Concerns**: Clear boundaries between UI, API, and data layers
- **Role-Based Structure**: Directory organization mirrors user permissions
- **Reusable Components**: Shared UI elements in components directory
- **Type Safety**: TypeScript throughout with strict configuration