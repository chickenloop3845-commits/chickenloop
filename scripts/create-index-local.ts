
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function createIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected.');

        console.log('Creating index on jobs collection...');
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        const collection = db.collection('jobs');
        const result = await collection.createIndex({ createdAt: -1 });

        console.log(`✅ Index created: ${result}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createIndex();
