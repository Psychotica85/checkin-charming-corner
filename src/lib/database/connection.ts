
// Konfiguration für die MySQL-Datenbankverbindung
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'mysql', // Container-Name im Docker-Netzwerk
  port: parseInt(import.meta.env.VITE_DB_PORT || '3306'),
  user: import.meta.env.VITE_DB_USER || 'checkin',
  password: import.meta.env.VITE_DB_PASSWORD || 'checkin', 
  database: import.meta.env.VITE_DB_NAME || 'checkin_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// API-Basis-URL für Anfragen
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Haupt-Wrapper-Funktion für Datenbankoperationen
export const withDatabase = async <T>(
  databaseFunction: (conn: any) => Promise<T>
): Promise<T> => {
  // Wenn wir im Browser sind, nutzen wir API-Endpunkte
  if (typeof window !== 'undefined') {
    try {
      // Im Produktivbetrieb sollte hier ein API-Aufruf an den Server erfolgen
      console.log("Client-seitiger API-Aufruf");
      return await fetch(`${API_BASE_URL}/api/db-operation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'db-operation' }),
      }).then(res => res.json());
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
      throw new Error("Kommunikation mit dem Backend fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    }
  }
  
  // In diesem Fall sind wir im Node.js-Kontext und können MySQL direkt verwenden
  try {
    console.log("Server-Kontext: Stelle direkte Datenbankverbindung her");
    
    // Dynamischer Import von mysql2/promise, um Browserprobleme zu vermeiden
    const mysql = await import('mysql2/promise');
    const pool = mysql.createPool(dbConfig);
    
    // Verbindung aus dem Pool holen
    const connection = await pool.getConnection();
    console.log("Datenbankverbindung hergestellt");
    
    try {
      // Funktion mit der Datenbankverbindung ausführen
      return await databaseFunction(connection);
    } finally {
      // Verbindung zurück in den Pool geben
      connection.release();
    }
  } catch (error) {
    console.error("Datenbankfehler:", error);
    throw new Error(`Datenbank-Fehler: ${error.message}`);
  }
};

// Datenbank-Initialisierung 
export const initializeDatabase = async (): Promise<void> => {
  // Prüfen, ob wir im Browser-Kontext sind
  if (typeof window !== 'undefined') {
    console.log("Browser-Kontext: Datenbank-Initialisierung wird vom Server durchgeführt");
    return;
  }
  
  try {
    console.log("Initialisiere Datenbankverbindung...");
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // Datenbank erstellen, falls sie nicht existiert
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Datenbank ${dbConfig.database} geprüft/erstellt`);
    
    // Datenbank auswählen
    await connection.query(`USE ${dbConfig.database}`);
    
    // Tabellen erstellen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id VARCHAR(36) PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        fullName VARCHAR(200) NOT NULL,
        company VARCHAR(100) NOT NULL,
        visitReason TEXT,
        visitDate DATE NOT NULL,
        visitTime VARCHAR(20) NOT NULL,
        acceptedRules BOOLEAN DEFAULT 0,
        acceptedDocuments TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        timezone VARCHAR(50),
        pdfData LONGTEXT
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        file LONGTEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR(36) PRIMARY KEY,
        address TEXT,
        logo LONGTEXT,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Datenbanktabellen sind initialisiert");
    
    await connection.end();
    return;
  } catch (error) {
    console.error("Fehler bei der Datenbankinitialisierung:", error);
    throw error;
  }
};
