/**
 * Migrate Newest 100 Jobs
 *
 * Migrates only the 100 newest jobs from Drupal to MongoDB
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { DrupalFetcher } from './drupal-fetcher';
import { MIGRATION_CONFIG } from './config';
import User from '../models/User';
import Job from '../models/Job';
import Company from '../models/Company';

async function migrateNewestJobs() {
  try {
    console.log('🚀 Migrating 100 Newest Jobs from Drupal to MongoDB');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all jobs from Drupal
    const fetcher = new DrupalFetcher();
    const allJobs = await fetcher.fetchJobs();

    // Sort by created timestamp (descending - newest first)
    const sortedJobs = allJobs.sort((a, b) => {
      const timeA = parseInt(a.created);
      const timeB = parseInt(b.created);
      return timeB - timeA;
    });

    // Take the 100 newest
    const newest100 = sortedJobs.slice(0, 100);

    console.log(`Total jobs in Drupal: ${allJobs.length}`);
    console.log(`Migrating newest: ${newest100.length}\n`);

    const stats = {
      migrated: 0,
      skipped: 0,
      errors: 0,
    };

    // Build user mapping first
    console.log('📋 Building user ID mapping...');
    const users = await User.find({}).lean();
    const userMapping = new Map<number, mongoose.Types.ObjectId>();

    // We need to map Drupal UIDs to MongoDB ObjectIds
    // Since we don't have the original Drupal UID stored, we'll need to fetch it
    // For now, we'll just check if user exists by matching the recruiter
    console.log(`Found ${users.length} users in MongoDB\n`);

    console.log('🔄 Starting migration of 100 newest jobs...\n');

    for (const [index, dJob] of newest100.entries()) {
      try {
        const created = new Date(parseInt(dJob.created) * 1000);
        const dateStr = created.toISOString().split('T')[0];

        // Check if job already exists by title and date
        const existing = await Job.findOne({
          title: dJob.title,
          datePosted: created,
        });

        if (existing) {
          console.log(`${index + 1}/100 ⏭️  Already exists: ${dJob.title} (${dateStr})`);
          stats.skipped++;
          continue;
        }

        // Fetch field data
        const fields = await fetcher.fetchNodeFields(parseInt(dJob.nid));

        // Find user by UID - we need to get the user
        // Since we migrated users, we need to find them
        // For now, let's use the first recruiter or admin as a fallback
        let recruiter = await User.findOne({ role: 'recruiter' });
        if (!recruiter) {
          recruiter = await User.findOne({ role: 'admin' });
        }

        if (!recruiter) {
          console.log(`${index + 1}/100 ⏭️  No recruiter found for: ${dJob.title}`);
          stats.skipped++;
          continue;
        }

        // Get company for recruiter
        let company = await Company.findOne({ owner: recruiter._id });

        // Extract field values
        const body = fields.body?.[0]?.value || '';
        const email = fields.field_job_email?.[0]?.email || '';
        const location = fields.field_job_location?.[0]?.value || '';
        const organization = fields.field_job_organization?.[0]?.value || '';
        const salary = fields.field_job_salary?.[0]?.value || '';

        // Parse location (simple approach)
        const [city, country] = parseLocation(location);

        const jobData = {
          title: dJob.title,
          description: body,
          company: organization || 'Unknown Company',
          city: city,
          country: country,
          salary: salary,
          type: 'full-time' as const,
          recruiter: recruiter._id,
          companyId: company?._id,
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
          validThrough: calculateValidThrough(parseInt(dJob.created)),
          createdAt: new Date(parseInt(dJob.created) * 1000),
          updatedAt: new Date(parseInt(dJob.changed) * 1000),
        };

        await Job.create(jobData);
        stats.migrated++;
        console.log(`${index + 1}/100 ✅ Migrated: ${dJob.title} (${dateStr})`);

      } catch (error: any) {
        console.error(`${index + 1}/100 ❌ Error: ${dJob.title} - ${error.message}`);
        stats.errors++;
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 Migration Summary:');
    console.log('═══════════════════════════════');
    console.log(`Migrated: ${stats.migrated}`);
    console.log(`Skipped:  ${stats.skipped}`);
    console.log(`Errors:   ${stats.errors}`);

    // Final count
    const totalJobs = await Job.countDocuments();
    console.log(`\nTotal jobs in MongoDB: ${totalJobs}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Helper: Parse location string
 */
function parseLocation(location: string): [string, string] {
  const parts = location.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return [parts[0], parts[parts.length - 1]];
  }
  return [location || 'Unknown', 'Unknown'];
}

/**
 * Helper: Calculate validThrough date
 */
function calculateValidThrough(createdTimestamp: number): Date {
  const created = new Date(createdTimestamp * 1000);
  const validThrough = new Date(created);
  validThrough.setDate(validThrough.getDate() + 90); // +90 days
  return validThrough;
}

migrateNewestJobs();
