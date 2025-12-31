import mongoose from 'mongoose';

// Import all models to ensure they are registered
// This prevents "Schema hasn't been registered" errors in serverless environments
import '@/models/User';
import '@/models/Job';
import '@/models/Company';
import '@/models/CV';
import '@/models/AuditLog';
import '@/models/CareerAdvice';
import '@/models/Application';
import '@/models/SavedSearch';

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

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Check if connection string is available
  const uri = process.env.MONGODB_URI?.trim() || MONGODB_URI;
  if (!uri) {
    console.error('[connectDB] MONGODB_URI not found in process.env or module scope');
    throw new Error('MONGODB_URI is not defined. Please check your .env.local file.');
  }
  
  console.log('[connectDB] Starting connection, readyState:', mongoose.connection.readyState);

  // Check if we have an existing connection that's actually ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection exists but is not ready, close it and reconnect
  if (cached.conn && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore errors when closing
    }
    cached.conn = null;
    cached.promise = null;
  }

  // If there's a pending promise that's taking too long, cancel it
  if (cached.promise) {
    // Check if the promise has been pending for more than 5 seconds
    // This is a safety check for stuck connections
    const promiseWithTimestamp = cached.promise as Promise<typeof mongoose> & { _startTime?: number };
    const promiseAge = Date.now() - (promiseWithTimestamp._startTime || 0);
    if (promiseAge > 5000) {
      console.warn('Clearing stale connection promise');
      cached.promise = null;
      cached.conn = null;
      // Force disconnect mongoose
      try {
        await mongoose.disconnect();
      } catch {
        // Ignore
      }
    }
  }

  if (!cached.promise) {
    // Detect if we're using local MongoDB or Atlas
    const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: isLocal ? 5000 : 10000, // Faster for local
      socketTimeoutMS: isLocal ? 30000 : 60000, // Shorter for local
      connectTimeoutMS: isLocal ? 5000 : 10000, // Faster for local
      maxPoolSize: isLocal ? 15 : 10, // More connections for local (increased from 10)
      minPoolSize: isLocal ? 3 : 1, // Maintain more connections for local (increased from 2)
      maxIdleTimeMS: isLocal ? 30000 : 10000, // Longer for local
      retryWrites: true,
      retryReads: true,
      // Use direct connection for local MongoDB
      directConnection: isLocal ? true : false,
      // Compression for better network performance
      compressors: ['zlib' as const],
      // Note: maxTimeMS is a query option, not a connection option
      // It should be set on individual queries, not here
    };

    // Mark start time for the promise
    const connectPromise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    }).catch((error) => {
      // Clear the promise on error so we can retry
      cached.promise = null;
      cached.conn = null;
      console.error('MongoDB connection error:', error.message);
      throw error;
    }) as Promise<typeof mongoose> & { _startTime?: number };
    connectPromise._startTime = Date.now();
    cached.promise = connectPromise;
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;

