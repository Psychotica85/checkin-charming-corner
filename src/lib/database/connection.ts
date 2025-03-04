
import type { Database } from 'better-sqlite3';

export type DatabaseCallback<T> = (db: Database) => T;
export type BrowserCallback<T> = () => T;

// Globale Variable zur Erkennung der Browser-Umgebung
declare global {
  interface Window {
    IS_BROWSER: boolean;
  }
}

// Setze IS_BROWSER auf true im Browser-Kontext
if (typeof window !== 'undefined') {
  window.IS_BROWSER = true;
  console.log("Browser-Umgebung erkannt, verwende localStorage statt SQLite");
}

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
        // Absoluter Pfad zur Datenbank mit korrekter Berechtigung
        const dbPath = '/app/data/database.sqlite';
        console.log(`Verbinden zur Datenbank unter: ${dbPath}`);
        
        // Datenbankverbindung mit detaillierter Fehlerbehandlung
        const db = new better_sqlite3(dbPath, { 
          verbose: console.log,
          fileMustExist: false
        });
        
        // Debug-Ausgabe für Datenbankstatus
        console.log(`Datenbank-Status: ${db ? 'Verbunden' : 'Nicht verbunden'}`);
        
        // Datenbank-Berechtigungen testen
        try {
          db.pragma('journal_mode = WAL');
          console.log("Datenbank-Schreibtest erfolgreich (PRAGMA-Befehl)");
        } catch (pragmaError) {
          console.error("Fehler bei Datenbank-Schreibtest:", pragmaError);
        }
        
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
            address TEXT,
            contactEmail TEXT,
            contactPhone TEXT,
            logo TEXT,
            updatedAt TEXT
          );
        `);
        
        console.log("Datenbankschema erfolgreich erstellt");
        
        // Führe die Funktion mit der Datenbankverbindung aus
        try {
          const result = serverFunction(db);
          return result;
        } finally {
          // Schließe die Datenbankverbindung
          db.close();
          console.log("Datenbankverbindung geschlossen");
        }
      } catch (dbError) {
        console.error('Fehler bei der Datenbankverbindung:', dbError);
        // Versuche, die Datenbankdatei direkt zu erstellen
        const fs = require('fs');
        const path = require('path');
        
        try {
          // Stelle sicher, dass der Ordner existiert
          if (!fs.existsSync('/app/data')) {
            fs.mkdirSync('/app/data', { recursive: true, mode: 0o777 });
            console.log('Datenverzeichnis erstellt: /app/data');
          }
          
          // Versuche, eine leere Datei zu erstellen
          fs.writeFileSync('/app/data/test_db_access.txt', 'Datenbankzugriff testen');
          console.log('Erfolgreich in Datenverzeichnis geschrieben');
          
          // Zugriffsberechtigungen anzeigen
          const stats = fs.statSync('/app/data');
          console.log(`Verzeichnisberechtigungen: ${stats.mode}`);
        } catch (fsError) {
          console.error('Fehler beim Dateisystemzugriff:', fsError);
        }
        
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
