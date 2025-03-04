
import type { Database } from 'better-sqlite3';

export type DatabaseCallback<T> = (db: Database) => T;
export type BrowserCallback<T> = () => T;

// Flag zur Erkennung der Server-Umgebung
const isServer = typeof window === 'undefined';

// Wrapper-Funktion, die die Datenbankfunktion verwendet und nur im Notfall auf Browser-Fallback zurückgreift
export const withDatabase = <T>(
  serverFunction: DatabaseCallback<T>,
  browserFunction: BrowserCallback<T>
): T => {
  console.log(`Running in ${isServer ? 'server' : 'browser'} environment`);
  
  // Wenn wir im Browser sind, wird eine Warnung ausgegeben, aber keine Fallback-Funktion ausgeführt
  if (!isServer) {
    console.error("FEHLER: Die Anwendung wird im Browser ausgeführt, aber die Datenbank ist nur auf dem Server verfügbar.");
    console.error("In dieser Umgebung kann nicht auf die Datenbank zugegriffen werden.");
    throw new Error("Datenbankzugriff im Browser nicht möglich. Bitte stellen Sie sicher, dass der Server korrekt konfiguriert ist.");
  }
  
  try {
    console.log("Verbinde zur SQLite-Datenbank...");
    
    // Dynamischer Import von better-sqlite3
    const better_sqlite3 = require('better-sqlite3');
    
    try {
      // Absoluter Pfad zur Datenbank mit korrekter Berechtigung
      const dbPath = '/app/data/database.sqlite';
      console.log(`Verbindung zur Datenbank unter: ${dbPath}`);
      
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
        throw pragmaError;
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
      console.error('KRITISCHER FEHLER: Datenbankverbindung fehlgeschlagen:', dbError);
      console.error('Stack-Trace:', dbError.stack);
      
      // Dateisysteminformationen anzeigen für bessere Diagnose
      const fs = require('fs');
      
      try {
        if (fs.existsSync('/app/data')) {
          console.log('Datenverzeichnis existiert. Verzeichnisinhalt:');
          const files = fs.readdirSync('/app/data');
          console.log(files.length > 0 ? files.join(', ') : 'Leeres Verzeichnis');
          
          // Berechtigungen prüfen
          const stats = fs.statSync('/app/data');
          console.log(`Verzeichnisberechtigungen: ${stats.mode}`);
          console.log(`Benutzer/Gruppe: ${stats.uid}/${stats.gid}`);
        } else {
          console.error('Datenverzeichnis "/app/data" existiert nicht!');
        }
      } catch (fsError) {
        console.error('Fehler beim Lesen des Datenverzeichnisses:', fsError);
      }
      
      // Keine Fallback-Funktion mehr aufrufen, stattdessen Fehler werfen
      throw new Error(`Datenbankverbindung fehlgeschlagen: ${dbError.message}`);
    }
  } catch (importError) {
    console.error('KRITISCHER FEHLER: better-sqlite3 Import fehlgeschlagen:', importError);
    console.error('Stack-Trace:', importError.stack);
    
    // Keine Fallback-Funktion mehr aufrufen, stattdessen Fehler werfen
    throw new Error(`Fehler beim Laden der Datenbankbibliothek: ${importError.message}`);
  }
};
