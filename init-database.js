
#!/usr/bin/env node

/**
 * Dieses Skript initialisiert die Datenbank für das Besucher Check-In System
 * Es erstellt die benötigten Tabellen und fügt Standarddaten ein
 */

import mysql from 'mysql2/promise';

// Datenbank-Konfiguration
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'checkin',
  password: process.env.DB_PASSWORD || 'checkin',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  ssl: false
};

// Datenbankname
const dbName = process.env.DB_NAME || 'checkin_db';

// Hauptfunktion zur Datenbankinitialisierung
async function initializeDatabase() {
  console.log('=== Besucher Check-In System: Datenbank-Initialisierung ===');
  console.log('Verbinde mit MySQL-Server...');
  
  let connection;
  
  try {
    // Verbindung ohne Datenbank herstellen (um die Datenbank zu erstellen)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl
    });
    
    console.log(`Verbindung zum MySQL-Server hergestellt: ${dbConfig.host}:${dbConfig.port}`);
    
    // Datenbank erstellen, falls sie nicht existiert
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Datenbank '${dbName}' überprüft/erstellt`);
    
    // Datenbank auswählen
    await connection.query(`USE ${dbName}`);
    
    // Tabellen erstellen
    console.log('Erstelle Tabellen...');
    
    // Check-ins Tabelle
    await connection.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id VARCHAR(36) PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        company VARCHAR(100) NOT NULL,
        visitReason TEXT NOT NULL,
        visitDate DATE NOT NULL,
        visitTime TIME NOT NULL,
        acceptedRules BOOLEAN NOT NULL DEFAULT 0,
        acceptedDocuments JSON,
        timestamp DATETIME NOT NULL,
        timezone VARCHAR(50) NOT NULL,
        pdfData LONGTEXT,
        INDEX idx_timestamp (timestamp),
        INDEX idx_company (company)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Tabelle 'checkins' überprüft/erstellt");
    
    // Dokumente Tabelle
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        file LONGTEXT NOT NULL,
        createdAt DATETIME NOT NULL,
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Tabelle 'documents' überprüft/erstellt");
    
    // Unternehmenseinstellungen Tabelle
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL DEFAULT 'Mein Unternehmen',
        address TEXT,
        logo LONGTEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_updatedAt (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Tabelle 'company_settings' überprüft/erstellt");
    
    // Prüfen, ob bereits Unternehmenseinstellungen existieren, sonst Standardwerte einfügen
    const [settings] = await connection.query('SELECT COUNT(*) as count FROM company_settings');
    const settingsCount = settings[0].count;
    
    if (settingsCount === 0) {
      await connection.query(`
        INSERT INTO company_settings (id, name, address, createdAt, updatedAt)
        VALUES ('1', 'Mein Unternehmen', 'Musterstraße 1, 12345 Musterstadt', NOW(), NOW())
      `);
      console.log("Standard-Unternehmenseinstellungen eingefügt");
    }
    
    console.log('Datenbankinitialisierung erfolgreich abgeschlossen!');
    return true;
  } catch (error) {
    console.error('Fehler bei der Datenbankinitialisierung:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Datenbankverbindung geschlossen');
    }
  }
}

// Skript ausführen
initializeDatabase()
  .then(() => {
    console.log('Datenbank-Setup erfolgreich abgeschlossen!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fehler beim Datenbank-Setup:', error);
    process.exit(1);
  });
