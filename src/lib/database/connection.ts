
import mongoose from 'mongoose';
import { prisma } from './prisma';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkin';

// Verbindungszustand
let isConnected = false;

/**
 * Verbindet zur Datenbank (MongoDB oder Prisma)
 */
export const connectToDatabase = async (): Promise<void> => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende Fallback-Mechanismus...');
    return Promise.resolve();
  }
  
  try {
    // Zuerst versuchen, Prisma zu verbinden
    await prisma.$connect();
    console.log('PrismaClient verbunden');
    
    // Dann versuchen, MongoDB zu verbinden, falls noch nicht verbunden
    if (!isConnected) {
      await mongoose.connect(MONGODB_URI);
      isConnected = true;
      console.log('MongoDB verbunden');
    }
  } catch (error) {
    console.error('Fehler bei der Datenbankverbindung:', error);
    throw new Error('Konnte keine Verbindung zur Datenbank herstellen.');
  }
};

/**
 * Trennt die Datenbankverbindung
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    return Promise.resolve();
  }
  
  try {
    await prisma.$disconnect();
    await mongoose.disconnect();
    isConnected = false;
    console.log('Datenbankverbindung getrennt');
  } catch (error) {
    console.error('Fehler beim Trennen der Datenbankverbindung:', error);
  }
};
