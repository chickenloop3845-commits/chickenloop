/**
 * Cleanup Jobs Script
 *
 * Removes jobs from MongoDB that don't exist in Drupal
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { DrupalFetcher } from './drupal-fetcher';
import { MIGRATION_CONFIG } from './config';
import Job from '../models/Job';

async function cleanupJobs() {
  try {
    console.log('🧹 Starting Job Cleanup Process');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all job node IDs from Drupal
    console.log('📥 Fetching all jobs from Drupal...');
    const fetcher = new DrupalFetcher();
    const drupalJobs = await fetcher.fetchJobs();
    const drupalJobTitles = new Set(drupalJobs.map(j => j.title.toLowerCase().trim()));

    console.log(`Found ${drupalJobs.length} jobs in Drupal`);
    console.log(`Unique titles: ${drupalJobTitles.size}\n`);

    // Get all jobs from MongoDB
    console.log('📤 Fetching all jobs from MongoDB...');
    const mongoJobs = await Job.find({}).lean();
    console.log(`Found ${mongoJobs.length} jobs in MongoDB\n`);

    // Identify jobs to remove (exist in MongoDB but not in Drupal)
    const jobsToRemove: any[] = [];

    for (const mongoJob of mongoJobs) {
      const mongoTitle = mongoJob.title.toLowerCase().trim();
      if (!drupalJobTitles.has(mongoTitle)) {
        jobsToRemove.push(mongoJob);
      }
    }

    console.log('🔍 Analysis Results:');
    console.log('═══════════════════════════════');
    console.log(`Jobs in Drupal:  ${drupalJobs.length}`);
    console.log(`Jobs in MongoDB: ${mongoJobs.length}`);
    console.log(`Jobs to remove:  ${jobsToRemove.length}\n`);

    if (jobsToRemove.length === 0) {
      console.log('✅ No orphaned jobs found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    // Show sample of jobs to be removed
    console.log('📋 Sample of jobs to be removed (first 10):');
    console.log('═══════════════════════════════════════════');
    jobsToRemove.slice(0, 10).forEach((job, i) => {
      const posted = job.datePosted ? job.datePosted.toISOString().split('T')[0] : 'N/A';
      console.log(`${i + 1}. ${job.title} - ${job.city || 'Unknown'}, ${job.country || 'Unknown'} (Posted: ${posted})`);
    });

    if (jobsToRemove.length > 10) {
      console.log(`... and ${jobsToRemove.length - 10} more`);
    }

    console.log('\n⚠️  This will permanently delete these jobs from MongoDB!');
    console.log('⚠️  Press Ctrl+C now to cancel, or wait 5 seconds to proceed...\n');

    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Remove the jobs
    console.log('🗑️  Removing orphaned jobs...');
    const jobIdsToRemove = jobsToRemove.map(j => j._id);
    const deleteResult = await Job.deleteMany({ _id: { $in: jobIdsToRemove } });

    console.log(`\n✅ Cleanup Complete!`);
    console.log(`Removed ${deleteResult.deletedCount} jobs from MongoDB\n`);

    // Verify final counts
    const finalMongoCount = await Job.countDocuments();
    console.log('📊 Final Counts:');
    console.log('═══════════════════════════════');
    console.log(`Drupal:  ${drupalJobs.length} jobs`);
    console.log(`MongoDB: ${finalMongoCount} jobs`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupJobs();
