
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Connect to PostgreSQL database using Prisma
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw new Error('Failed to connect to PostgreSQL database');
  }
};

/**
 * Helper to handle database queries with TypeScript
 */
export const executeQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
  try {
    await connectToDatabase();
    return await queryFn();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
