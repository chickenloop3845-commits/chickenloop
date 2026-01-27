/**
 * Keep Only Latest 30 Jobs
 *
 * Removes all jobs except the 30 newest from MongoDB
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { MIGRATION_CONFIG } from './config';
import Job from '../models/Job';

async function keepLatest30Jobs() {
  try {
    console.log('🧹 Keeping Only Latest 30 Jobs in MongoDB');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Get all jobs sorted by datePosted (newest first)
    console.log('📥 Fetching all jobs from MongoDB...');
    const allJobs = await Job.find({})
      .sort({ datePosted: -1 })
      .lean();

    console.log(`Found ${allJobs.length} jobs in MongoDB\n`);

    if (allJobs.length <= 30) {
      console.log('✅ Already have 30 or fewer jobs. No cleanup needed.');
      await mongoose.disconnect();
      return;
    }

    // Keep the first 30 (newest), remove the rest
    const jobsToKeep = allJobs.slice(0, 30);
    const jobsToRemove = allJobs.slice(30);

    console.log(`📊 Analysis:`);
    console.log(`   Jobs to keep:   ${jobsToKeep.length}`);
    console.log(`   Jobs to remove: ${jobsToRemove.length}\n`);

    // Show the 30 jobs we're keeping
    console.log('✅ Keeping these 30 newest jobs:');
    console.log('═══════════════════════════════════════');
    jobsToKeep.forEach((job: any, i: number) => {
      const date = job.datePosted ? job.datePosted.toISOString().split('T')[0] : 'N/A';
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${job.title} (${date})`);
    });

    console.log('\n⚠️  Removing all other jobs...');
    console.log('⚠️  Press Ctrl+C now to cancel, or wait 3 seconds...\n');

    // Wait 3 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Remove old jobs
    const jobIdsToRemove = jobsToRemove.map((job: any) => job._id);
    const deleteResult = await Job.deleteMany({ _id: { $in: jobIdsToRemove } });

    console.log(`\n✅ Cleanup Complete!`);
    console.log(`Removed ${deleteResult.deletedCount} old jobs\n`);

    // Verify final count
    const finalCount = await Job.countDocuments();
    console.log('📊 Final Count:');
    console.log('═══════════════════════════════');
    console.log(`Jobs in MongoDB: ${finalCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

keepLatest30Jobs();
