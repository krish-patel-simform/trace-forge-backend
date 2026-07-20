import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb(): Promise<void> {
  const URI = env.MONGO_URI;

  if (!URI) {
    console.error('[DB] MONGO_URI is not defined. Check your .env file.');
    process.exit(1);
  }

  // Emit Mongoose-level events for observability.
  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connected successfully.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('[DB] MongoDB connection error:', err.message);
  });

  try {
    await mongoose.connect(URI, {
      // Abort the initial connection attempt after 10 s — prevents the
      // server from hanging forever if MongoDB is unreachable at startup.
      serverSelectionTimeoutMS: 10_000,

      // How long the driver waits for a socket operation (query/write).
      socketTimeoutMS: 45_000,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DB] Failed to connect to MongoDB:', message);
    process.exit(1);
  }
}

connectDb();
