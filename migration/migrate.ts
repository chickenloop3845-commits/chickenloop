/**
 * Main Migration Script
 *
 * Migrates data from Drupal 7 to MongoDB (Next.js)
 *
 * Usage:
 *   npm run migrate              # Full migration
 *   npm run migrate --dry-run    # Test run without writing
 *   npm run migrate --users      # Migrate only users
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { DrupalFetcher } from './drupal-fetcher';
import { MIGRATION_CONFIG } from './config';
import fs from 'fs/promises';
import path from 'path';

// Import models
import User from '../models/User';
import Job from '../models/Job';
import CV from '../models/CV';
import Application from '../models/Application';
import Company from '../models/Company';

class Migrator {
  private fetcher: DrupalFetcher;
  private dryRun: boolean;
  private stats: any;

  // ID mappings
  private userMapping = new Map<number, mongoose.Types.ObjectId>();
  private nodeMapping = new Map<number, mongoose.Types.ObjectId>();
  private profileMapping = new Map<number, mongoose.Types.ObjectId>();

  constructor(dryRun = false) {
    this.fetcher = new DrupalFetcher();
    this.dryRun = dryRun;
    this.stats = {
      users: { fetched: 0, migrated: 0, skipped: 0, errors: 0 },
      jobs: { fetched: 0, migrated: 0, skipped: 0, errors: 0 },
      cvs: { fetched: 0, migrated: 0, skipped: 0, errors: 0 },
      applications: { fetched: 0, migrated: 0, skipped: 0, errors: 0 },
      companies: { fetched: 0, migrated: 0, skipped: 0, errors: 0 },
    };
  }

  /**
   * Main migration flow
   */
  async run() {
    console.log('🚀 Starting Drupal → MongoDB Migration');
    console.log('=' .repeat(60));

    if (this.dryRun) {
      console.log('⚠️  DRY RUN MODE - No data will be written\n');
    }

    try {
      // Connect to MongoDB
      await this.connectMongoDB();

      // Get counts from Drupal
      const drupalCounts = await this.fetcher.getCounts();
      console.log('\n📊 Drupal Entity Counts:');
      console.log(JSON.stringify(drupalCounts, null, 2));

      // Backup current MongoDB data
      if (!this.dryRun && MIGRATION_CONFIG.backup.enabled) {
        await this.backupMongoDB();
      }

      // Migration phases
      console.log('\n📦 Phase 1: Migrating Users...');
      await this.migrateUsers();

      console.log('\n📦 Phase 2: Migrating Companies...');
      await this.migrateCompanies();

      console.log('\n📦 Phase 3: Migrating Jobs...');
      await this.migrateJobs();

      console.log('\n📦 Phase 4: Migrating CVs...');
      await this.migrateCVs();

      console.log('\n📦 Phase 5: Migrating Applications...');
      await this.migrateApplications();

      // Validation
      console.log('\n✅ Phase 6: Validating Migration...');
      await this.validate(drupalCounts);

      // Generate report
      await this.generateReport();

      console.log('\n🎉 Migration Complete!');
    } catch (error: any) {
      console.error('\n❌ Migration Failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }

  /**
   * Connect to MongoDB
   */
  private async connectMongoDB() {
    console.log('🔌 Connecting to MongoDB...');

    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  }

  /**
   * Backup MongoDB collections
   */
  private async backupMongoDB() {
    console.log('💾 Backing up current MongoDB data...');

    const backupDir = path.join(process.cwd(), MIGRATION_CONFIG.backup.path);
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    const backup: any = {};

    // Backup each collection
    backup.users = await User.find({}).lean();
    backup.jobs = await Job.find({}).lean();
    backup.cvs = await CV.find({}).lean();
    backup.applications = await Application.find({}).lean();
    backup.companies = await Company.find({}).lean();

    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup saved to: ${backupFile}`);
    console.log(`   Users: ${backup.users.length}`);
    console.log(`   Jobs: ${backup.jobs.length}`);
    console.log(`   CVs: ${backup.cvs.length}`);
    console.log(`   Applications: ${backup.applications.length}`);
    console.log(`   Companies: ${backup.companies.length}`);
  }

  /**
   * Migrate Users
   */
  private async migrateUsers() {
    const drupalUsers = await this.fetcher.fetchUsers();
    this.stats.users.fetched = drupalUsers.length;

    console.log(`Found ${drupalUsers.length} users in Drupal`);

    for (const dUser of drupalUsers) {
      try {
        // Determine role
        let role: 'recruiter' | 'job-seeker' | 'admin' = 'job-seeker';

        if (dUser.roles && dUser.roles.includes('1')) {
          role = 'admin'; // Role ID 1 is usually admin
        } else if (dUser.roles && dUser.roles.includes('3')) {
          role = 'recruiter'; // Adjust based on actual role IDs
        }

        const userData = {
          email: dUser.mail.toLowerCase(),
          password: dUser.pass || '$2a$10$invalidhashplaceholder', // Will need password reset
          role: role,
          name: dUser.name,
          favouriteJobs: [],
          favouriteCandidates: [],
          lastOnline: dUser.access ? new Date(parseInt(dUser.access) * 1000) : undefined,
          notesEnabled: true,
          createdAt: new Date(parseInt(dUser.created) * 1000),
          updatedAt: new Date(),
        };

        if (!this.dryRun) {
          // Check if user already exists
          const existing = await User.findOne({ email: userData.email });

          if (existing) {
            console.log(`  ⏭️  User already exists: ${dUser.mail}`);
            this.userMapping.set(parseInt(dUser.uid), existing._id as mongoose.Types.ObjectId);
            this.stats.users.skipped++;
          } else {
            const newUser = await User.create(userData);
            this.userMapping.set(parseInt(dUser.uid), newUser._id as mongoose.Types.ObjectId);
            this.stats.users.migrated++;
            console.log(`  ✅ Migrated user: ${dUser.mail} (uid: ${dUser.uid} → ${newUser._id})`);
          }
        } else {
          console.log(`  [DRY RUN] Would migrate: ${dUser.mail}`);
          this.stats.users.migrated++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error migrating user ${dUser.uid}:`, error.message);
        this.stats.users.errors++;
      }
    }

    console.log(`\nUser Migration Summary:`);
    console.log(`  Fetched: ${this.stats.users.fetched}`);
    console.log(`  Migrated: ${this.stats.users.migrated}`);
    console.log(`  Skipped: ${this.stats.users.skipped}`);
    console.log(`  Errors: ${this.stats.users.errors}`);
  }

  /**
   * Migrate Companies
   */
  private async migrateCompanies() {
    console.log('Creating placeholder companies for recruiters...');

    if (this.dryRun) {
      console.log('[DRY RUN] Would create companies');
      return;
    }

    // Get all recruiters
    const recruiters = await User.find({ role: 'recruiter' });
    console.log(`Found ${recruiters.length} recruiters`);

    for (const recruiter of recruiters) {
      try {
        // Check if company already exists
        const existing = await Company.findOne({ owner: recruiter._id });

        if (!existing) {
          await Company.create({
            name: `${recruiter.name}'s Company`,
            description: 'Migrated from Drupal',
            owner: recruiter._id,
            featured: false,
            createdAt: recruiter.createdAt,
            updatedAt: new Date(),
          });
          this.stats.companies.migrated++;
          console.log(`  ✅ Created company for: ${recruiter.name}`);
        } else {
          this.stats.companies.skipped++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error creating company for ${recruiter.name}:`, error.message);
        this.stats.companies.errors++;
      }
    }

    console.log(`\nCompany Migration Summary:`);
    console.log(`  Migrated: ${this.stats.companies.migrated}`);
    console.log(`  Skipped: ${this.stats.companies.skipped}`);
    console.log(`  Errors: ${this.stats.companies.errors}`);
  }

  /**
   * Migrate Jobs
   */
  private async migrateJobs() {
    const drupalJobs = await this.fetcher.fetchJobs();
    this.stats.jobs.fetched = drupalJobs.length;

    console.log(`Found ${drupalJobs.length} jobs in Drupal`);
    console.log(`Migrating first 10 jobs as sample...`);

    // Migrate first 10 as sample
    const jobsToMigrate = drupalJobs.slice(0, 10);

    for (const dJob of jobsToMigrate) {
      try {
        // Fetch field data
        const fields = await this.fetcher.fetchNodeFields(parseInt(dJob.nid));

        // Map recruiter
        const recruiterId = this.userMapping.get(parseInt(dJob.uid));
        if (!recruiterId) {
          console.log(`  ⏭️  Skipping job ${dJob.nid}: User ${dJob.uid} not found`);
          this.stats.jobs.skipped++;
          continue;
        }

        // Get company for recruiter
        let companyId;
        if (!this.dryRun) {
          const company = await Company.findOne({ owner: recruiterId });
          companyId = company?._id;
        }

        // Extract field values
        const body = fields.body?.[0]?.value || '';
        const email = fields.field_job_email?.[0]?.email || '';
        const location = fields.field_job_location?.[0]?.value || '';
        const organization = fields.field_job_organization?.[0]?.value || '';
        const salary = fields.field_job_salary?.[0]?.value || '';

        // Parse location (simple approach)
        const [city, country] = this.parseLocation(location);

        const jobData = {
          title: dJob.title,
          description: body,
          company: organization || 'Unknown Company',
          city: city,
          country: country,
          salary: salary,
          type: 'full-time' as const, // Default
          recruiter: recruiterId,
          companyId: companyId,
          languages: [],
          qualifications: [],
          sports: [],
          occupationalAreas: [],
          pictures: [],
          spam: 'no' as const,
          published: parseInt(dJob.status) === 1,
          featured: false,
          visitCount: 0,
          applyByEmail: !!email,
          applicationEmail: email,
          datePosted: new Date(parseInt(dJob.created) * 1000),
          validThrough: this.calculateValidThrough(parseInt(dJob.created)),
          createdAt: new Date(parseInt(dJob.created) * 1000),
          updatedAt: new Date(parseInt(dJob.changed) * 1000),
        };

        if (!this.dryRun) {
          const newJob = await Job.create(jobData);
          this.nodeMapping.set(parseInt(dJob.nid), newJob._id as mongoose.Types.ObjectId);
          this.stats.jobs.migrated++;
          console.log(`  ✅ Migrated job: ${dJob.title} (nid: ${dJob.nid} → ${newJob._id})`);
        } else {
          console.log(`  [DRY RUN] Would migrate: ${dJob.title}`);
          this.stats.jobs.migrated++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error migrating job ${dJob.nid}:`, error.message);
        this.stats.jobs.errors++;
      }
    }

    console.log(`\nJob Migration Summary (sample):`);
    console.log(`  Fetched: ${this.stats.jobs.fetched}`);
    console.log(`  Migrated: ${this.stats.jobs.migrated}`);
    console.log(`  Skipped: ${this.stats.jobs.skipped}`);
    console.log(`  Errors: ${this.stats.jobs.errors}`);
  }

  /**
   * Migrate CVs (placeholder)
   */
  private async migrateCVs() {
    console.log('CV migration not implemented in this sample');
    // Similar to jobs migration
  }

  /**
   * Migrate Applications (placeholder)
   */
  private async migrateApplications() {
    console.log('Application migration not implemented in this sample');
    // Similar to jobs migration
  }

  /**
   * Validate migration
   */
  private async validate(drupalCounts: any) {
    console.log('Running validation checks...');

    if (!this.dryRun) {
      const mongoCounts = {
        users: await User.countDocuments(),
        jobs: await Job.countDocuments(),
        cvs: await CV.countDocuments(),
        applications: await Application.countDocuments(),
        companies: await Company.countDocuments(),
      };

      console.log('\nValidation Results:');
      console.log('Drupal → MongoDB:');
      console.log(`  Users: ${drupalCounts.users} → ${mongoCounts.users}`);
      console.log(`  Jobs: ${drupalCounts.jobs} → ${mongoCounts.jobs}`);
      console.log(`  CVs: ${drupalCounts.profiles} → ${mongoCounts.cvs}`);
      console.log(`  Applications: ${drupalCounts.applications} → ${mongoCounts.applications}`);
      console.log(`  Companies: (new) → ${mongoCounts.companies}`);
    }
  }

  /**
   * Generate migration report
   */
  private async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: this.dryRun,
      stats: this.stats,
      mappings: {
        users: this.userMapping.size,
        nodes: this.nodeMapping.size,
        profiles: this.profileMapping.size,
      }
    };

    const reportFile = path.join(
      process.cwd(),
      'migration',
      `migration-report-${Date.now()}.json`
    );

    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
  }

  /**
   * Helper: Parse location string
   */
  private parseLocation(location: string): [string, string] {
    // Simple parser - split by comma
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0], parts[parts.length - 1]];
    }
    return [location || 'Unknown', 'Unknown'];
  }

  /**
   * Helper: Calculate validThrough date
   */
  private calculateValidThrough(createdTimestamp: number): Date {
    const created = new Date(createdTimestamp * 1000);
    const validThrough = new Date(created);
    validThrough.setDate(validThrough.getDate() + 90); // +90 days
    return validThrough;
  }
}

// CLI execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const migrator = new Migrator(dryRun);
migrator.run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
