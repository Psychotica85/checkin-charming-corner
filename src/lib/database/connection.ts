// Node-Typen
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// Prüfen, ob wir im Browser-Kontext sind
export const isBrowser = typeof window !== 'undefined';

// Konfiguration für die MySQL-Datenbankverbindung
const getDbConfig = () => {
  // Im Browser-Kontext
  if (isBrowser) {
    return {
      host: (import.meta as any).env?.VITE_DB_HOST || 'mysql',
      port: parseInt((import.meta as any).env?.VITE_DB_PORT || '3306'),
      user: (import.meta as any).env?.VITE_DB_USER || 'checkin',
      password: (import.meta as any).env?.VITE_DB_PASSWORD || 'checkin', 
      database: (import.meta as any).env?.VITE_DB_NAME || 'checkin_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  } 
  // Im Server-Kontext
  else {
    return {
      host: process.env.DB_HOST || 'mysql',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'checkin',
      password: process.env.DB_PASSWORD || 'checkin', 
      database: process.env.DB_NAME || 'checkin_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  }
};

// API-Basis-URL für Anfragen
export const API_BASE_URL = isBrowser 
  ? ((import.meta as any).env?.VITE_API_URL || '') 
  : (process.env.API_URL || '');

// Haupt-Wrapper-Funktion für Datenbankoperationen
export const withDatabase = async <T>(
  databaseFunction: (conn: any) => Promise<T>
): Promise<T> => {
  // Wenn wir im Browser sind, werfen wir einen Fehler
  if (isBrowser) {
    console.error("Direkter Datenbankzugriff im Browser wird nicht unterstützt. Bitte verwenden Sie die API-Funktionen.");
    throw new Error("Datenbankzugriff im Browser nicht möglich.");
  }
  
  // In diesem Fall sind wir im Node.js-Kontext und können MySQL direkt verwenden
  try {
    console.log("Server-Kontext: Stelle direkte Datenbankverbindung her");
    
    // Dynamischer Import von mysql2/promise, um Browserprobleme zu vermeiden
    // @ts-ignore
    const mysql = await import('mysql2/promise');
    
    // Konfiguration für die MySQL-Datenbankverbindung
    const dbConfig = getDbConfig();
    
    console.log("MySQL-Verbindungskonfiguration:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    const pool = mysql.createPool(dbConfig);
    
    // Verbindung aus dem Pool holen
    const connection = await pool.getConnection();
    console.log("Datenbankverbindung erfolgreich hergestellt");
    
    try {
      // Funktion mit der Datenbankverbindung ausführen
      return await databaseFunction(connection);
    } finally {
      // Verbindung zurück in den Pool geben
      connection.release();
      console.log("Datenbankverbindung zurückgegeben");
    }
  } catch (error) {
    console.error("Datenbankfehler:", error);
    throw new Error(`Datenbank-Fehler: ${error.message}`);
  }
};

// Datenbank-Initialisierung
export const initializeDatabase = async (): Promise<void> => {
  if (isBrowser) {
    console.log("Browser-Kontext: Datenbank-Initialisierung wird vom Server durchgeführt");
    return;
  }
  
  try {
    console.log("Initialisiere Datenbankverbindung...");
    // @ts-ignore
    const mysql = await import('mysql2/promise');
    const dbConfig = getDbConfig();
    
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log(`Verbindung zu MySQL-Server hergestellt: ${dbConfig.host}:${dbConfig.port}`);
    
    // Datenbank erstellen, falls sie nicht existiert
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Datenbank '${dbConfig.database}' überprüft/erstellt`);
    
    // Datenbank auswählen
    await connection.query(`USE ${dbConfig.database}`);
    
    // Tabellen erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id VARCHAR(36) PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        fullName VARCHAR(200) GENERATED ALWAYS AS (CONCAT(firstName, ' ', lastName)) VIRTUAL,
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
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL DEFAULT 'Mein Unternehmen',
        address TEXT,
        logo LONGTEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_updatedAt (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Tabelle 'company_settings' überprüft/erstellt");
    
    // Prüfen, ob bereits Unternehmenseinstellungen existieren, sonst Standardwerte einfügen
    const [settings] = await connection.query('SELECT COUNT(*) as count FROM company_settings');
    const settingsCount = (settings as any)[0].count;
    
    if (settingsCount === 0) {
      await connection.query(`
        INSERT INTO company_settings (id, name, address, createdAt, updatedAt)
        VALUES ('1', 'Mein Unternehmen', 'Musterstraße 1, 12345 Musterstadt', NOW(), NOW())
      `);
      console.log("Standard-Unternehmenseinstellungen eingefügt");
    }
    
    await connection.end();
    console.log("Datenbankinitialisierung abgeschlossen.");
  } catch (error) {
    console.error("Fehler bei der Datenbankinitialisierung:", error);
    throw error;
  }
};
