
import { connectToDatabase } from '../../database/connection';
import { prisma } from '../../database/prisma';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

// Rollenzuordnungs-Hilfsfunktionen
export const mapPrismaRoleToFrontendRole = (role: 'ADMIN' | 'USER'): 'admin' | 'user' => {
  return role === 'ADMIN' ? 'admin' : 'user';
};

export const mapFrontendRoleToPrismaRole = (role: 'admin' | 'user'): 'ADMIN' | 'USER' => {
  return role === 'admin' ? 'ADMIN' : 'USER';
};

// Hilfsfunktion zur Sicherstellung der Datenbankverbindung
export const withDatabase = async <T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> => {
  // Im Browser immer Fallback verwenden
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende localStorage-Fallback');
    return fallback();
  }
  
  try {
    await connectToDatabase();
    return await operation();
  } catch (error) {
    console.error('Datenbankoperationsfehler:', error);
    return fallback();
  }
};
