
import type { Database } from 'better-sqlite3';

export type DatabaseCallback<T> = (db: Database) => T;
export type BrowserCallback<T> = () => T;

// Wrapper-Funktion, die entweder die Server- oder Browser-Version verwendet
export const withDatabase = <T>(
  serverFunction: DatabaseCallback<T>,
  browserFunction: BrowserCallback<T>
): T => {
  // Überprüfen, ob wir uns im Browser befinden
  if (typeof window !== 'undefined' && window.IS_BROWSER) {
    console.log("Running in browser environment - using localStorage");
    // Wir sind im Browser, verwende die Browser-Version
    return browserFunction();
  } else {
    try {
      console.log("Running in server environment - using SQLite");
      // Dynamischer Import von better-sqlite3, damit es nicht im Browser geladen wird
      const better_sqlite3 = require('better-sqlite3');
      
      try {
        // Pfad zur Datenbank
        const dbPath = 'data/database.sqlite';
        console.log(`Attempting to connect to database at: ${dbPath}`);
        
        // Datenbankverbindung herstellen
        const db = new better_sqlite3(dbPath, { verbose: console.log });
        
        // Schema erstellen (wenn es noch nicht existiert)
        db.exec(`
          CREATE TABLE IF NOT EXISTS checkins (
            id TEXT PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            fullName TEXT NOT NULL,
            company TEXT NOT NULL,
            visitReason TEXT,
            visitDate TEXT,
            visitTime TEXT,
            acceptedRules INTEGER DEFAULT 0,
            acceptedDocuments TEXT,
            timestamp TEXT NOT NULL,
            timezone TEXT NOT NULL,
            pdfData TEXT
          );
          
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            fileData TEXT NOT NULL,
            uploadedAt TEXT NOT NULL
          );
          
          CREATE TABLE IF NOT EXISTS company_settings (
            id INTEGER PRIMARY KEY,
            companyName TEXT,
            companyLogo TEXT,
            address TEXT,
            contactEmail TEXT,
            contactPhone TEXT,
            updatedAt TEXT
          );
        `);
        
        console.log("Database schema created successfully");
        
        // Führe die Funktion mit der Datenbankverbindung aus
        try {
          const result = serverFunction(db);
          return result;
        } finally {
          // Schließe die Datenbankverbindung
          db.close();
          console.log("Database connection closed");
        }
      } catch (dbError) {
        console.error('Fehler bei der Datenbankverbindung:', dbError);
        // Fallback zum Browser-Verhalten im Falle eines Datenbankfehlers
        console.log("Fallback to browser implementation due to database error");
        return browserFunction();
      }
    } catch (importError) {
      console.error('Fehler beim Importieren von better-sqlite3:', importError);
      console.log('Fallback to browser implementation due to import error');
      // Fallback zum Browser-Verhalten im Falle eines Fehlers
      return browserFunction();
    }
  }
};
