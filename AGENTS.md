# Agent Guidelines for ChickenLoop

This document provides rules and best practices for AI agents working on this codebase to ensure optimized code that deploys to Vercel without errors.

## Deployment Rules

### 1. Build Verification
- Always run `npm run build` locally before committing to verify the build passes
- The build must complete without errors or warnings
- Fix any TypeScript errors before pushing

### 2. ESLint Compliance
- All code must pass ESLint checks
- For legacy scripts using `require()`, add at the top:
  ```javascript
  /* eslint-disable @typescript-eslint/no-require-imports */
  ```
- Avoid `any` type - use proper types or `unknown` with type guards
- Remove unused variables and imports
- Handle catch blocks properly: use `catch (error: unknown)` not `catch (e: any)`

### 3. Environment Variables
- Never commit `.env.local` to git
- Required env vars for production:
  - `MONGODB_URI` - MongoDB connection string
  - `JWT_SECRET` - Authentication secret
  - `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage (auto-injected by Vercel)
- Verify env vars are set in Vercel Dashboard before deploying

---

## Performance Optimization Rules

### 4. API Response Optimization
- Use MongoDB projections to exclude heavy fields from list endpoints:
  ```typescript
  const projection = { _id: 1, title: 1, name: 1 }; // Only include needed fields
  collection.find(query).project(projection);
  ```
- Exclude from list APIs: `description`, `pictures` arrays (load on detail pages)
- Add cache headers to API responses:
  ```typescript
  import { CachePresets } from '@/lib/cache';
  return NextResponse.json(data, { headers: CachePresets.short() });
  ```

### 5. Image Optimization
- Use Next.js `Image` component instead of `<img>` tags
- Add `priority` prop only to above-the-fold images (hero, first viewport)
- Use `loading="lazy"` for below-the-fold images (handled automatically by Next.js Image)
- Store images as URLs (e.g., Vercel Blob Storage), NOT as base64 in MongoDB
- If base64 images exist, migrate them using `scripts/migrate-company-logos.ts` as template

### 6. Image File Sizes
- Hero/banner images: max 2000px width, < 1MB
- Thumbnails: optimize for display size, not source size
- Use WebP/AVIF formats when possible

---

## Database Best Practices

### 7. MongoDB Performance
- Always use `.lean()` for read-only queries
- Add appropriate indexes for frequently queried fields
- Use connection pooling (already configured in `lib/db.ts`)
- Add timeouts to prevent hanging: `.maxTimeMS(10000)`

### 8. Data Storage
- Store images as URLs pointing to Blob Storage, not base64 strings
- Keep document sizes small (< 16MB max, aim for < 100KB for list items)
- Use references (`ObjectId`) instead of embedding large nested documents

---

## Code Quality

### 9. TypeScript Standards
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` with type guards
- Use strict null checks
- Export types from model files

### 10. Error Handling
- Use try-catch with proper error typing:
  ```typescript
  try {
    // code
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }
  ```
- Return meaningful error messages in API responses
- Log errors server-side for debugging

---

## Vercel-Specific Rules

### 11. Vercel Configuration
- Keep `vercel.json` minimal and correct
- Cache static assets with long TTLs:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)\\.(jpg|jpeg|png|gif|webp|avif|ico|svg)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ]
  }
  ```

### 12. Serverless Function Limits
- Keep API routes fast (< 10 seconds)
- Use connection pooling for database connections
- Avoid writing to filesystem (use Blob Storage instead)

### 13. Git Integration
- Production deploys from `main` branch on `chickenloop3845-commits/chickenloop`
- Always push to both `origin` and `prod` remotes to keep repos in sync:
  ```bash
  git push prod local/main:main
  git push origin local/main:main
  ```

---

## Testing Before Deploy

Before pushing to production:
1. `npm run build` - Verify build passes
2. `npm run lint` - Check for linting errors
3. Test critical pages load correctly
4. Check browser console for errors
5. Verify API endpoints return expected data

---

## Type Safety and Code Quality

### 14. TypeScript Type Safety Improvements
The codebase has undergone significant improvements to ensure type safety and prevent Vercel build failures:

**Type Safety Improvements:**
- **Replace `any` types** with proper TypeScript types:
  - Use `Record<string, unknown>` for generic objects
  - Define explicit interfaces for all data structures
  - Use `unknown` with type guards for error handling
  - Example:
    ```typescript
    // ❌ Bad
    const data: any = await response.json();
    
    // ✅ Good
    interface ApiResponse {
      success: boolean;
      data?: Record<string, unknown>;
    }
    const data: ApiResponse = await response.json();
    ```

**Fixed TypeScript Compilation Errors:**
The following utilities have been reviewed and improved for type safety:
- **Email utility** (`lib/email.ts`): Proper typing for Resend API responses
- **JWT utility** (`lib/jwt.ts`): Explicit `JWTPayload` interface
- **Database connection** (`lib/db.ts`): Type-safe MongoDB connection pooling
- **Job matching** (`lib/jobMatching.ts`): Properly typed job queries and populated fields

**Deployment Readiness Checklist:**
Before deploying to Vercel, ensure:
- ✅ All TypeScript compilation errors are resolved
- ✅ ESLint passes without `@typescript-eslint/no-explicit-any` errors
- ✅ No `any` types in new code (use proper interfaces or `unknown`)
- ✅ Error handling uses `catch (error: unknown)` pattern
- ✅ All utilities have proper type exports
- ✅ Build completes successfully with `npm run build`
- ✅ Environment variables are properly typed and validated

### 15. Typechecking with Opus-4.5
For comprehensive type checking and validation:
- Use **Opus-4.5 subprocess** for advanced type analysis
- This ensures all type errors are caught before deployment
- The subprocess provides deeper type inference than standard TSC
- Run before committing changes that modify types or interfaces

---

## Quick Reference: Common Issues

| Issue | Solution |
|-------|----------|
| `require is not allowed` | Add ESLint disable comment at file top |
| `any type` error | Replace with proper interface or `unknown` |
| Large API payload | Add MongoDB projection, exclude heavy fields |
| Slow page load | Check for base64 images, add lazy loading |
| Build fails on Vercel | Check env vars are set, run build locally first |
| Images not loading | Use Next.js Image component, check `remotePatterns` in `next.config.ts` |
