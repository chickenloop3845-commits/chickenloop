import mongoose from 'mongoose';

// Import all models to ensure they are registered before any database operations
// This is critical for serverless environments where modules may load independently
import '@/models/User';
import '@/models/Job';
import '@/models/Company';
import '@/models/CV';
import '@/models/AuditLog';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI.trim();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    // Log registered models in development for debugging
    if (process.env.NODE_ENV === 'development') {
      const registeredModels = Object.keys(mongoose.models);
      console.log('[DB] Using cached connection. Registered models:', registeredModels);
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Log registered models after connection
      const registeredModels = Object.keys(mongoose.models);
      console.log('[DB] Connected to MongoDB. Registered models:', registeredModels);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

