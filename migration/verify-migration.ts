import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verifyMigration() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Get collections
    const db = mongoose.connection.db;

    // Count documents in each collection
    const users = await db.collection('users').countDocuments();
    const jobs = await db.collection('jobs').countDocuments();
    const companies = await db.collection('companies').countDocuments();
    const cvs = await db.collection('cvs').countDocuments();
    const applications = await db.collection('applications').countDocuments();

    console.log('📊 MongoDB Collection Counts:');
    console.log('═══════════════════════════════');
    console.log(`Users:        ${users}`);
    console.log(`Jobs:         ${jobs}`);
    console.log(`Companies:    ${companies}`);
    console.log(`CVs:          ${cvs}`);
    console.log(`Applications: ${applications}`);
    console.log('');

    // Get sample of recently created users
    console.log('👥 Recently Migrated Users (sample):');
    console.log('═══════════════════════════════════════');
    const recentUsers = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    recentUsers.forEach((user: any, i: number) => {
      console.log(`${i + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString().split('T')[0]}`);
    });
    console.log('');

    // Get sample of recently created jobs
    console.log('💼 Recently Migrated Jobs (sample):');
    console.log('══════════════════════════════════════');
    const recentJobs = await db.collection('jobs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    recentJobs.forEach((job: any, i: number) => {
      const date = job.createdAt ? job.createdAt.toISOString().split('T')[0] : 'N/A';
      console.log(`${i + 1}. ${job.title} - ${job.city || 'Unknown'}, ${job.country || 'Unknown'} (Posted: ${date})`);
    });
    console.log('');

    // Verify migration from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const migratedToday = await db.collection('users')
      .countDocuments({ createdAt: { $gte: today } });

    console.log('✅ Migration Verification:');
    console.log('═══════════════════════════');
    console.log(`Users migrated today: ${migratedToday}`);
    console.log('');

    if (users >= 4500 && migratedToday > 3000) {
      console.log('🎉 Migration SUCCESSFUL!');
      console.log('   - User count matches expected (~4,500)');
      console.log(`   - ${migratedToday} users migrated today`);
    } else {
      console.log('⚠️  Migration verification notes:');
      console.log(`   - Total users: ${users} (expected ~4,500)`);
      console.log(`   - New users today: ${migratedToday} (expected ~4,000)`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyMigration();
