# Entity Relationship Diagram - ChickenLoop Next.js

## ER Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ Job : "posts (recruiter)"
    User ||--o{ Company : "owns"
    User ||--o{ CV : "creates"
    User ||--o{ Application : "submits"
    User }o--o{ Job : "favorites (favouriteJobs)"
    User }o--o{ User : "favorites (favouriteCandidates)"

    Company ||--o{ Job : "has"

    Job ||--o{ Application : "receives"

    CV ||--o{ Application : "used in"

    User {
        ObjectId _id PK
        string email UK "unique, required"
        string password "required"
        enum role "job-seeker | recruiter | admin"
        string name
        ObjectId[] favouriteJobs FK "references Job"
        ObjectId[] favouriteCandidates FK "references User"
        Date lastOnline
        boolean notesEnabled
        Date createdAt
        Date updatedAt
    }

    Company {
        ObjectId _id PK
        string name "required"
        string description
        ObjectId owner FK "references User, required"
        string logo "URL"
        string website "URL"
        string location
        boolean featured
        Date createdAt
        Date updatedAt
    }

    Job {
        ObjectId _id PK
        string title "required"
        string description "required"
        string company "required"
        string city
        string country
        string salary
        enum type "full-time | part-time | contract | freelance"
        ObjectId recruiter FK "references User, required"
        ObjectId companyId FK "references Company"
        string[] languages
        string[] qualifications
        string[] sports
        string[] occupationalAreas
        string[] pictures "URLs to Vercel Blob"
        enum spam "no | yes | maybe"
        boolean published
        boolean featured
        number visitCount
        boolean applyByEmail
        string applicationEmail
        Date datePosted
        Date validThrough
        Date createdAt
        Date updatedAt
    }

    CV {
        ObjectId _id PK
        ObjectId userId FK "references User, required"
        string firstName "required"
        string lastName "required"
        string email "required"
        string phone
        string location
        string summary
        string[] languages
        string[] sports
        string[] qualifications
        string cvFileUrl "URL to Vercel Blob"
        string profilePictureUrl "URL to Vercel Blob"
        Date createdAt
        Date updatedAt
    }

    Application {
        ObjectId _id PK
        ObjectId jobId FK "references Job, required"
        ObjectId applicantId FK "references User, required"
        ObjectId cvId FK "references CV"
        string coverLetter
        string[] attachments "URLs to Vercel Blob"
        enum status "pending | reviewed | shortlisted | rejected | accepted"
        Date createdAt
        Date updatedAt
    }
```

## Relationships Explained

### User Relationships
- **User → Job (as recruiter)**: One-to-Many
  - A recruiter user can post multiple jobs
  - Field: `Job.recruiter` references `User._id`

- **User → Company (as owner)**: One-to-Many
  - A user can own multiple companies
  - Field: `Company.owner` references `User._id`

- **User → CV**: One-to-Many
  - A job-seeker user can create multiple CVs
  - Field: `CV.userId` references `User._id`

- **User → Application**: One-to-Many
  - A user can submit multiple applications
  - Field: `Application.applicantId` references `User._id`

- **User ↔ Job (favorites)**: Many-to-Many
  - Users can favorite multiple jobs
  - Field: `User.favouriteJobs` is an array of `Job._id`

- **User ↔ User (favorites)**: Many-to-Many (self-referencing)
  - Recruiters can favorite multiple candidates
  - Field: `User.favouriteCandidates` is an array of `User._id`

### Company Relationships
- **Company → Job**: One-to-Many
  - A company can have multiple job postings
  - Field: `Job.companyId` references `Company._id`

### Job Relationships
- **Job → Application**: One-to-Many
  - A job can receive multiple applications
  - Field: `Application.jobId` references `Job._id`

### CV Relationships
- **CV → Application**: One-to-Many
  - A CV can be used in multiple applications
  - Field: `Application.cvId` references `CV._id`

## Key Design Patterns

### 1. **Embedded Arrays for Many-to-Many**
- Favorites are stored as arrays of ObjectIds in the User document
- This denormalization improves read performance for user profiles

### 2. **File Storage**
- All files (images, CVs, attachments) are stored in Vercel Blob
- Only URLs are stored in MongoDB
- Images are preprocessed (resized to 800px, compressed to <100KB)

### 3. **Soft Relationships**
- Job can have both `company` (string) and `companyId` (ObjectId)
- This allows jobs without a formal Company entity
- Useful for migrated data where company entities don't exist

### 4. **Status Tracking**
- Applications have status enum for workflow management
- Jobs have spam detection enum (no/yes/maybe)
- Jobs have published flag for draft/live state

### 5. **Metadata**
- All entities have `createdAt` and `updatedAt` timestamps
- Jobs track `visitCount` for analytics
- Users track `lastOnline` for activity monitoring

## Indexes (Recommended)

```javascript
// User
User.index({ email: 1 }, { unique: true })
User.index({ role: 1 })

// Job
Job.index({ recruiter: 1 })
Job.index({ companyId: 1 })
Job.index({ published: 1, datePosted: -1 })
Job.index({ country: 1, city: 1 })

// Company
Company.index({ owner: 1 })

// CV
CV.index({ userId: 1 })

// Application
Application.index({ jobId: 1 })
Application.index({ applicantId: 1 })
Application.index({ status: 1 })
```

## Data Statistics (Current)

- **Users**: 4,507 (mostly job-seekers from Drupal migration)
- **Jobs**: 30 (newest jobs migrated, with images)
- **Companies**: 84 (auto-created for recruiters)
- **CVs**: 151
- **Applications**: 28
- **Job Images**: 53 images across all 30 jobs (avg 1.77 per job)

## Migration Notes

- Migrated from Drupal 7 (300+ tables) to this simplified 5-entity model
- 97% reduction in database complexity
- All users migrated with preserved creation dates
- Latest 30 jobs migrated with full field data and images
- Images downloaded from Drupal, resized, compressed, and uploaded to Vercel Blob
