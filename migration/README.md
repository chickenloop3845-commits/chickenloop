# Drupal → MongoDB Migration Scripts

This directory contains scripts for migrating data from the legacy Drupal 7 MySQL database to the new Next.js MongoDB database.

## Files

- **config.ts** - Configuration for Drupal SSH connection and MongoDB URI
- **drupal-fetcher.ts** - Class for extracting data from Drupal via Drush
- **migrate.ts** - Main migration orchestrator

## Prerequisites

1. SSH access to Drupal server configured in `~/.ssh/config`
2. MongoDB URI in `.env.local`
3. Node.js dependencies installed: `npm install`

## Usage

### Dry Run (Test Mode)

Run migration without writing to MongoDB:

```bash
npm run migrate:dry-run
```

This will:
- Connect to Drupal via SSH
- Fetch all data from Drupal
- Show what would be migrated
- Generate statistics without modifying MongoDB

### Actual Migration

Run the full migration:

```bash
npm run migrate
```

This will:
1. Backup current MongoDB data to `migration/backups/`
2. Migrate users from Drupal
3. Create companies for recruiters
4. Migrate jobs (first 10 as sample)
5. Migrate CVs (placeholder)
6. Migrate applications (placeholder)
7. Validate counts
8. Generate migration report

## Migration Phases

### Phase 1: Users
- Fetches all users from Drupal `users` table
- Maps Drupal roles to Next.js roles (admin, recruiter, job-seeker)
- Creates MongoDB users with password placeholders (users will need to reset)
- Stores UID → ObjectId mapping

### Phase 2: Companies
- Creates placeholder companies for all recruiters
- One company per recruiter (1:1 relationship)

### Phase 3: Jobs
- Fetches job nodes from Drupal
- Extracts field data (body, location, salary, etc.)
- Maps to MongoDB job documents
- Currently migrates first 10 as sample

### Phase 4: CVs (To Be Implemented)
- Will migrate CV profiles from Drupal
- Map to MongoDB CV documents

### Phase 5: Applications (To Be Implemented)
- Will migrate applications
- Handle job applications and general recruiter contacts

### Phase 6: Validation
- Compares Drupal counts with MongoDB counts
- Reports migration success/failure

## ID Mappings

The migrator maintains three mapping tables:

- `userMapping`: Drupal UID → MongoDB User._id
- `nodeMapping`: Drupal NID → MongoDB Job._id
- `profileMapping`: Drupal Profile ID → MongoDB CV._id

These are used to maintain referential integrity when migrating related entities.

## Backup

Backups are automatically created before migration (unless disabled in config or running dry-run). Backups are stored as JSON files in `migration/backups/` with timestamps.

To restore from backup:
```bash
# Manual restore using mongoimport or custom restore script
# This would need to be implemented if needed
```

## Configuration

Edit `migration/config.ts` to customize:

- Drupal SSH connection details
- MongoDB connection URI
- Backup settings
- Batch sizes

## Logs and Reports

After each migration run, a report is generated:

- `migration/migration-report-[timestamp].json`

Contains:
- Statistics for each entity type (fetched, migrated, skipped, errors)
- Mapping table sizes
- Timestamp and dry-run status

## Troubleshooting

**Error: Cannot connect to Drupal**
- Check SSH configuration in `~/.ssh/config`
- Test: `ssh chickenloop`

**Error: Cannot connect to MongoDB**
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running

**Error: User already exists**
- The script skips existing users to prevent duplicates
- Check migration report for skipped counts

## Safety Features

- Dry-run mode for testing
- Automatic backups before migration
- Existing user detection (no duplicates)
- Error handling and logging
- Sample migration (first 10 jobs) to test before full run

## Next Steps

To migrate all data:

1. Test with dry-run: `npm run migrate:dry-run`
2. Review output and statistics
3. Run actual migration: `npm run migrate`
4. Validate data in MongoDB
5. Implement CV and Application migrations (currently placeholders)
6. Run full migration for all jobs (remove slice(0, 10) limit)
