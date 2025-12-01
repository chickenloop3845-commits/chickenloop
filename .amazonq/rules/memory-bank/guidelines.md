# Development Guidelines and Standards

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All components and functions use explicit TypeScript interfaces
- **Interface definitions**: Complex objects have dedicated interfaces (e.g., `ICompany`, `User`, `Job`)
- **Type safety**: Props are typed with interfaces, API responses are typed
- **Generic types**: Use `Document` and `Model` from mongoose for database models

### Component Architecture
- **Client-side components**: Use `'use client'` directive for interactive components
- **Server components**: Default to server components unless interactivity is needed
- **Component separation**: Split complex UI into focused sub-components
- **Props interfaces**: Define clear interfaces for component props

### Error Handling Patterns
- **Try-catch blocks**: Wrap async operations in comprehensive error handling
- **User feedback**: Display errors in UI with appropriate styling (`bg-red-100 border border-red-400`)
- **API error responses**: Return structured error objects with status codes
- **Graceful degradation**: Handle loading states and missing data

## Structural Conventions

### File Organization
- **Route handlers**: API routes in `app/api/[resource]/route.ts` format
- **Page components**: Pages in `app/[route]/page.tsx` structure
- **Shared components**: Reusable components in `app/components/`
- **Models**: Database schemas in `models/` directory with TypeScript interfaces

### Naming Conventions
- **Components**: PascalCase (e.g., `DraggableMap`, `LocationSearchSection`)
- **Files**: kebab-case for pages, PascalCase for components
- **Variables**: camelCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for configuration arrays

### Import Organization
- **External libraries first**: React, Next.js, third-party packages
- **Internal imports**: Local components, utilities, models
- **Relative imports**: Use `@/` alias for project root references
- **Dynamic imports**: Use `dynamic()` for client-only components with SSR disabled

## Semantic Patterns

### State Management
- **useState hooks**: Local component state with descriptive names
- **useEffect patterns**: Separate effects for different concerns
- **Context usage**: Global auth state via `AuthContext`
- **Form state**: Controlled components with validation

### API Integration
- **Authentication middleware**: `requireRole()` function for route protection
- **Database connection**: `connectDB()` utility for MongoDB connection
- **Response formatting**: Consistent JSON response structure
- **Error handling**: Standardized error responses with appropriate HTTP status codes

### Data Validation
- **Required fields**: Validate required data before processing
- **Data cleaning**: Trim strings and normalize empty values to `undefined`
- **Type conversion**: Handle coordinate data as numbers
- **Array validation**: Validate array lengths (e.g., max 3 pictures)

## Internal API Usage Patterns

### Authentication Flow
```typescript
// Route protection pattern
const user = requireRole(request, ['recruiter', 'admin']);
await connectDB();

// User context access
const { user, loading } = useAuth();
```

### Database Operations
```typescript
// Model creation with validation
const company = await Company.create({
  name,
  coordinates: coordinates || undefined,
  owner: user.userId,
});

// Nested object updates
company.markModified('address');
await company.save();
```

### Component Patterns
```typescript
// Dynamic imports for client-only components
const DraggableMap = dynamic(
  () => import('../components/DraggableMap'),
  { ssr: false, loading: () => <LoadingComponent /> }
);

// Hydration-safe components
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <PlaceholderComponent />;
```

### Form Handling
```typescript
// Controlled form state
const [editForm, setEditForm] = useState({
  name: '',
  email: '',
  role: '',
});

// Form submission with validation
const handleSubmit = async () => {
  if (!editForm.name) {
    setError('Name is required');
    return;
  }
  // Process form...
};
```

## Frequently Used Code Idioms

### Conditional Rendering
- **Loading states**: `{loading ? <LoadingSpinner /> : <Content />}`
- **Error boundaries**: `{error && <ErrorMessage />}`
- **Conditional classes**: Template literals with conditional CSS classes
- **Optional chaining**: Safe property access with `?.` operator

### Array Operations
- **Filter operations**: Remove items with `array.filter((item, index) => index !== targetIndex)`
- **Map with index**: Transform arrays with `array.map((item, index) => ...)`
- **Spread operations**: Add items with `[...existingArray, newItem]`

### Event Handling
- **Async handlers**: Wrap async operations in try-catch blocks
- **Form events**: Use `e.target.value` for input changes
- **Confirmation dialogs**: Use `confirm()` for destructive actions
- **Debounced search**: Use `setTimeout` with cleanup for search inputs

## Popular Annotations and Comments

### Component Documentation
```typescript
// Component to display coordinates (prevents hydration mismatch)
// Component wrapper for location search (prevents hydration mismatch)
// Dynamically import map component to avoid SSR issues
```

### API Documentation
```typescript
// GET - Get current recruiter's company
// POST - Create a new company (recruiters only, one per recruiter)
// Clean up empty strings in nested objects
// Validate that coordinates are required
```

### Database Patterns
```typescript
// Update nested objects properly - normalize empty strings to undefined
// If all fields are undefined, set to undefined
// Mark modified for nested object updates
```

### UI/UX Patterns
```typescript
// Handle clicks outside dropdown
// Debounce search input
// Prevent hydration mismatch
// Loading state management
```

## Development Best Practices

### Performance Optimization
- **Dynamic imports**: Load heavy components only when needed
- **Memoization**: Use `useEffect` dependencies appropriately
- **Image optimization**: Validate file sizes and types before upload
- **Database queries**: Use specific field selection and indexing

### Security Practices
- **Role-based access**: Validate user permissions on every API call
- **Input sanitization**: Trim and validate all user inputs
- **File upload validation**: Check file types and sizes
- **Environment variables**: Use secure configuration for sensitive data

### User Experience
- **Loading indicators**: Show progress during async operations
- **Error feedback**: Clear, actionable error messages
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Proper labels and ARIA attributes for form elements