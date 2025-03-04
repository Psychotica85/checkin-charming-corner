
// PrismaClient für Browser und Node.js
import { PrismaClient } from '@prisma/client';

// Globaler Typ für den PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

// Fallback für Browser-Umgebung
class PrismaClientFallback {
  // Prisma-Methoden simulieren
  async $connect() {
    console.log('Browser-Umgebung: Prisma-Verbindung simuliert.');
    return Promise.resolve();
  }
  
  async $disconnect() {
    console.log('Browser-Umgebung: Prisma-Verbindung getrennt.');
    return Promise.resolve();
  }

  // Simuliere count
  async count() {
    console.log('Browser-Umgebung: count simuliert');
    return 0;
  }

  // Simuliere user-spezifische Methoden
  user = {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  };

  // Simuliere document-spezifische Methoden
  document = {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  };

  // Simuliere checkIn-spezifische Methoden
  checkIn = {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  };
}

// PrismaClient für Node.js oder Fallback für Browser
export const prisma = isBrowser 
  ? (new PrismaClientFallback() as unknown as PrismaClient)
  : (global.prisma || new PrismaClient());

// Speichere PrismaClient in globalThis im Entwicklungsmodus in Node.js
if (!isBrowser && process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
