
import { createPool, Pool } from 'mysql2/promise';

// Konfiguration für die MySQL-Datenbankverbindung
const dbConfig = {
  host: process.env.DB_HOST || 'mysql', // Container-Name im Docker-Netzwerk
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'checkin',
  password: process.env.DB_PASSWORD || 'checkin', 
  database: process.env.DB_NAME || 'checkin_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool für Datenbankverbindungen
let pool: Pool | null = null;

// Initialisiere den Verbindungspool
const getPool = async (): Promise<Pool> => {
  if (pool) return pool;
  
  console.log("Erstelle MySQL-Verbindungspool mit folgender Konfiguration:");
  console.log(`- Host: ${dbConfig.host}`);
  console.log(`- Port: ${dbConfig.port}`);
  console.log(`- Benutzer: ${dbConfig.user}`);
  console.log(`- Datenbank: ${dbConfig.database}`);
  
  try {
    pool = createPool(dbConfig);
    
    // Teste die Verbindung
    const connection = await pool.getConnection();
    console.log("MySQL-Verbindung erfolgreich hergestellt");
    connection.release();
    
    return pool;
  } catch (error) {
    console.error("Fehler beim Erstellen des MySQL-Verbindungspools:", error);
    throw error;
  }
};

// Schema-Initialisierung
export const initializeDatabase = async (): Promise<void> => {
  console.log("Initialisiere Datenbankschema...");
  const pool = await getPool();
  
  try {
    const conn = await pool.getConnection();
    
    // Erstelle Tabellen, wenn sie nicht existieren
    await conn.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id VARCHAR(50) PRIMARY KEY,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        fullName VARCHAR(200) NOT NULL,
        company VARCHAR(200) NOT NULL,
        visitReason TEXT,
        visitDate VARCHAR(30),
        visitTime VARCHAR(30),
        acceptedRules BOOLEAN DEFAULT FALSE,
        acceptedDocuments TEXT,
        timestamp VARCHAR(50) NOT NULL,
        timezone VARCHAR(50) NOT NULL,
        pdfData LONGTEXT
      );
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        file LONGTEXT NOT NULL,
        createdAt VARCHAR(50) NOT NULL
      );
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR(50) PRIMARY KEY,
        address TEXT,
        logo LONGTEXT,
        updatedAt VARCHAR(50) NOT NULL
      );
    `);
    
    // Füge Standardeinstellungen ein, wenn keine vorhanden sind
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM company_settings');
    const count = (rows as any)[0].count;
    
    if (count === 0) {
      await conn.query(`
        INSERT INTO company_settings (id, address, logo, updatedAt)
        VALUES (?, ?, ?, ?);
      `, [
        '1',
        'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
        '',
        new Date().toISOString()
      ]);
      console.log("Standardeinstellungen für Unternehmen angelegt");
    }
    
    console.log("Datenbankschema erfolgreich initialisiert");
    conn.release();
  } catch (error) {
    console.error("Fehler bei der Initialisierung des Datenbankschemas:", error);
    throw error;
  }
};

// Typdefinitionen für Callback-Funktionen
export type DatabaseCallback<T> = (conn: any) => Promise<T>;

// Haupt-Wrapper-Funktion für Datenbankoperationen
export const withDatabase = async <T>(
  databaseFunction: DatabaseCallback<T>
): Promise<T> => {
  console.log("Starte Datenbankoperation");
  
  // Bestimme, ob wir im Server- oder Browser-Kontext sind
  const isServer = typeof window === 'undefined';
  
  if (!isServer) {
    console.error("FEHLER: Die Anwendung wird im Browser ausgeführt, aber die Datenbankoperationen müssen auf dem Server erfolgen.");
    throw new Error("Datenbankzugriff im Browser nicht möglich. Diese Operation muss auf dem Server ausgeführt werden.");
  }
  
  let connection = null;
  
  try {
    // Hole Pool und Verbindung
    const pool = await getPool();
    connection = await pool.getConnection();
    console.log("Datenbankverbindung hergestellt");
    
    // Führe die übergebene Funktion aus
    const result = await databaseFunction(connection);
    console.log("Datenbankoperation erfolgreich abgeschlossen");
    
    return result;
  } catch (error) {
    console.error("Fehler bei Datenbankoperation:", error);
    throw error;
  } finally {
    // Verbindung zurückgeben
    if (connection) {
      connection.release();
      console.log("Datenbankverbindung freigegeben");
    }
  }
};
