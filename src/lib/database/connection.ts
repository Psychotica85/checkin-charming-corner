
// SQLite-Datenbankverbindung
// Wir verwenden einen Browser-Fallback, da SQLite nur im Node.js-Umfeld funktioniert

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

// SQLite Modul (nur im Node.js-Umfeld)
let db: any = null;

/**
 * Initialisiert die SQLite-Datenbank
 */
const initializeDatabase = () => {
  if (isBrowser) return null;
  
  try {
    // Nur im Node.js-Umfeld ausführen
    const Database = require('better-sqlite3');
    const db = new Database('checkin.db');
    
    // Tabellen erstellen, falls sie nicht existieren
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        file TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS checkins (
        id TEXT PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        fullName TEXT NOT NULL,
        company TEXT NOT NULL,
        visitReason TEXT,
        visitDate TEXT,
        visitTime TEXT,
        acceptedRules INTEGER NOT NULL,
        acceptedDocuments TEXT,
        timestamp TEXT NOT NULL,
        timezone TEXT,
        pdfData TEXT
      );
    `);
    
    return db;
  } catch (error) {
    console.error('Fehler bei der Initialisierung der SQLite-Datenbank:', error);
    return null;
  }
};

/**
 * Hilfsfunktion zur Sicherstellung der Datenbankverbindung
 * Im Browser verwenden wir localStorage als Fallback
 */
export const withDatabase = async <T>(
  operation: (db: any) => T, 
  fallback: () => T
): Promise<T> => {
  // Im Browser immer Fallback verwenden
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende localStorage-Fallback');
    return fallback();
  }
  
  try {
    // Datenbank initialisieren, falls noch nicht geschehen
    if (!db) {
      db = initializeDatabase();
    }
    
    // Wenn die Datenbankinitialisierung fehlgeschlagen ist, Fallback verwenden
    if (!db) {
      console.log('SQLite-Datenbankinitialisierung fehlgeschlagen, verwende Fallback');
      return fallback();
    }
    
    // Diese Funktion wird im Node.js-Umfeld ausgeführt
    console.log('Server-Umgebung erkannt, verwende SQLite');
    return operation(db);
  } catch (error) {
    console.error('Datenbankoperationsfehler:', error);
    return fallback();
  }
};
