# Technology Stack and Dependencies

## Core Technologies

### Frontend Framework
- **Next.js 16.0.3**: React framework with App Router
- **React 19.2.0**: UI library with latest features
- **TypeScript 5**: Static type checking
- **Tailwind CSS 4**: Utility-first CSS framework

### Backend Infrastructure
- **Next.js API Routes**: Server-side API endpoints
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose 8.19.4**: MongoDB object modeling for Node.js

### Authentication & Security
- **JSON Web Tokens (jsonwebtoken 9.0.2)**: Stateless authentication
- **bcryptjs 3.0.3**: Password hashing and verification
- **Middleware**: Route protection and role-based access control

### Geographic Features
- **Leaflet 1.9.4**: Open-source interactive maps
- **React Leaflet 5.0.0**: React components for Leaflet maps
- **Geocoding API**: Address to coordinates conversion

### File Storage
- **Vercel Blob 2.0.0**: Cloud file storage for production
- **Local File System**: Development file uploads

## Development Dependencies

### Code Quality & Linting
- **ESLint 9**: JavaScript/TypeScript linting
- **eslint-config-next 16.0.3**: Next.js specific ESLint rules

### Build Tools
- **PostCSS**: CSS processing with Tailwind
- **@tailwindcss/postcss 4**: Tailwind CSS integration

### Type Definitions
- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions
- **@types/react-dom**: React DOM type definitions
- **@types/bcryptjs**: bcryptjs type definitions
- **@types/jsonwebtoken**: JWT type definitions
- **@types/leaflet**: Leaflet mapping type definitions

## Development Commands

### Local Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production bundle
npm start           # Start production server
npm run lint        # Run ESLint code analysis
```

### Database Operations
```bash
# MongoDB connection scripts
node scripts/check-all-databases.js     # Verify database connections
node scripts/create-admin-user.js       # Create admin user
node scripts/read-all-data.js          # Export all data
```

### Deployment Scripts
```bash
./deploy.sh                    # Full deployment pipeline
./vercel-deploy.sh            # Vercel-specific deployment
./setup-mongodb.sh            # MongoDB configuration
./sync-vercel-env.sh          # Environment variable sync
```

## Environment Configuration

### Required Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/chickenloop
JWT_SECRET=your-secret-key-change-in-production
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token  # Production only
```

### Development Setup
1. **Node.js 18+**: Required runtime environment
2. **MongoDB**: Local instance or cloud connection
3. **Vercel CLI**: For deployment and blob storage (optional for local dev)

## Production Infrastructure

### Hosting Platform
- **Vercel**: Primary hosting with automatic deployments
- **GitHub Integration**: Continuous deployment from repository
- **Edge Functions**: Global distribution for API routes

### Database Hosting
- **MongoDB Atlas**: Cloud database service
- **Connection Pooling**: Mongoose connection management
- **Data Persistence**: Automatic backups and scaling

### File Storage Strategy
- **Development**: Local file system in public/uploads/
- **Production**: Vercel Blob Storage with CDN
- **Image Optimization**: Next.js automatic image optimization

## Performance Optimizations

### Next.js Features
- **App Router**: Improved routing and layouts
- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Automatic image processing
- **Static Generation**: Pre-built pages where possible

### Database Optimization
- **Mongoose Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Data Validation**: Schema-level data integrity

### Caching Strategy
- **Next.js Cache**: Automatic page and API caching
- **Browser Caching**: Static asset optimization
- **CDN Distribution**: Global content delivery