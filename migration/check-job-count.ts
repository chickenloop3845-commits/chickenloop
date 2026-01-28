import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';

async function checkJobCount() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed');
    }

    const jobCount = await db.collection('jobs').countDocuments();
    console.log(`\n📊 Current job count in MongoDB: ${jobCount}`);

    // Get a few recent ones
    const recentJobs = await db.collection('jobs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log('\n📋 Most recent 5 jobs:');
    recentJobs.forEach((job: any, i: number) => {
      console.log(`${i + 1}. ${job.title} - ${job.city || 'Unknown'}, ${job.country || 'Unknown'}`);
    });

    await mongoose.disconnect();
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkJobCount();
