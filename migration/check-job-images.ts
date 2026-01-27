/**
 * Check Job Images
 *
 * Analyzes what images are stored in the jobs
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { MIGRATION_CONFIG } from './config';
import Job from '../models/Job';

async function checkJobImages() {
  try {
    console.log('🖼️  Checking Job Images in MongoDB');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Get all jobs
    const jobs = await Job.find({}).lean();
    console.log(`Found ${jobs.length} jobs in MongoDB\n`);

    let jobsWithImages = 0;
    let jobsWithoutImages = 0;
    let totalImages = 0;

    console.log('📊 Image Analysis:');
    console.log('═══════════════════════════════════════\n');

    jobs.forEach((job: any, index: number) => {
      const pictures = job.pictures || [];
      const hasImages = pictures.length > 0;

      if (hasImages) {
        jobsWithImages++;
        totalImages += pictures.length;
        console.log(`${index + 1}. ${job.title}`);
        console.log(`   Images: ${pictures.length}`);
        pictures.forEach((pic: string, i: number) => {
          console.log(`   ${i + 1}. ${pic}`);
        });
        console.log('');
      } else {
        jobsWithoutImages++;
      }
    });

    console.log('\n' + '═'.repeat(60));
    console.log('📈 Summary:');
    console.log('═'.repeat(60));
    console.log(`Total jobs:           ${jobs.length}`);
    console.log(`Jobs with images:     ${jobsWithImages}`);
    console.log(`Jobs without images:  ${jobsWithoutImages}`);
    console.log(`Total images:         ${totalImages}`);
    console.log(`Avg images per job:   ${jobs.length > 0 ? (totalImages / jobs.length).toFixed(2) : 0}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkJobImages();
