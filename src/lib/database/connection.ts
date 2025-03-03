
import mongoose from 'mongoose';

// Environment variables
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/checkin';

// Connection state
let isConnected = false;

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) return;
  
  try {
    // MongoDB 7 compatibility options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

/**
 * Helper to handle MongoDB queries with TypeScript
 * This solves TypeScript calling issues with Mongoose
 */
export const executeQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
  try {
    await connectToDatabase();
    return await queryFn();
  } catch (error) {
    console.error('MongoDB query error:', error);
    throw error;
  }
};
