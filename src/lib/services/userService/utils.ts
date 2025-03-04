
import { connectToDatabase } from '../../database/connection';
import { prisma } from '../../database/prisma';

// Role mapping utilities
export const mapPrismaRoleToFrontendRole = (role: 'ADMIN' | 'USER'): 'admin' | 'user' => {
  return role === 'ADMIN' ? 'admin' : 'user';
};

export const mapFrontendRoleToPrismaRole = (role: 'admin' | 'user'): 'ADMIN' | 'USER' => {
  return role === 'admin' ? 'ADMIN' : 'USER';
};

// Helper to ensure database connection
export const withDatabase = async <T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> => {
  try {
    await connectToDatabase();
    return await operation();
  } catch (error) {
    console.error('Database operation error:', error);
    return fallback();
  }
};
