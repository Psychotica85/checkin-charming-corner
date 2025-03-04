
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
  // Implementiere Methoden, die im Browser verwendet werden könnten
  async $connect() {
    console.log('Browser-Umgebung: Prisma-Verbindung simuliert.');
    return Promise.resolve();
  }
  
  async $disconnect() {
    console.log('Browser-Umgebung: Prisma-Verbindung getrennt.');
    return Promise.resolve();
  }
}

// PrismaClient für Node.js oder Fallback für Browser
export const prisma = isBrowser 
  ? (new PrismaClientFallback() as unknown as PrismaClient)
  : (global.prisma || new PrismaClient());

// Speichere PrismaClient in globalThis im Entwicklungsmodus in Node.js
if (!isBrowser && process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
