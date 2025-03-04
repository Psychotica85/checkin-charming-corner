
import Database from 'better-sqlite3';
import { join } from 'path';

// SQLite-Datenbankpfad
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/app/data/checkin.db' 
  : join(process.cwd(), 'data/checkin.db');

let db: Database.Database | null = null;

/**
 * Verbindet zur SQLite-Datenbank
 */
export const connectToDatabase = (): Database.Database => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, SQLite nicht verfügbar - verwende localStorage');
    return null as any;
  }
  
  if (!db) {
    try {
      console.log(`Verbinde zu SQLite-Datenbank: ${DB_PATH}`);
      
      // Stellt sicher, dass das Verzeichnis existiert
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(DB_PATH);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      db = new Database(DB_PATH);
      
      // Datenbankschemata initialisieren
      initializeDatabaseSchema(db);
      
      console.log('SQLite-Datenbank erfolgreich verbunden');
    } catch (error) {
      console.error('Fehler bei der SQLite-Datenbankverbindung:', error);
      throw new Error('Konnte keine Verbindung zur SQLite-Datenbank herstellen.');
    }
  }
  
  return db;
};

/**
 * Initialisiert das Datenbankschema, falls noch nicht vorhanden
 */
const initializeDatabaseSchema = (db: Database.Database): void => {
  // Tabelle für Benutzer
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
  
  // Tabelle für Dokumente
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      file TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
  
  // Tabelle für Check-ins
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkIns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      timezone TEXT NOT NULL,
      pdfData BLOB
    )
  `);
  
  // Standard-Admin-Benutzer erstellen, falls noch nicht vorhanden
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    db.prepare(`
      INSERT INTO users (username, password, role, createdAt)
      VALUES (?, ?, ?, ?)
    `).run('admin', 'admin', 'ADMIN', new Date().toISOString());
    
    console.log('Standard-Admin-Benutzer erstellt');
  }
};

/**
 * Trennt die SQLite-Datenbankverbindung
 */
export const disconnectFromDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('SQLite-Datenbankverbindung getrennt');
  }
};

// Hilfsfunktion zur Sicherstellung der Datenbankverbindung
export const withDatabase = async <T>(
  operation: (db: Database.Database) => T, 
  fallback: () => T
): Promise<T> => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  // Im Browser immer Fallback verwenden
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende localStorage-Fallback');
    return fallback();
  }
  
  try {
    const db = connectToDatabase();
    return operation(db);
  } catch (error) {
    console.error('Datenbankoperationsfehler:', error);
    return fallback();
  }
};
