
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

// Diese Variable bestimmt, ob wir die Datenbank direkt ansprechen
// Im Produktionssystem wird dies immer auf "false" gesetzt
export const useLocalStorage = false;

// Typ-Definitionen für Callback-Funktionen
export type DatabaseCallback<T> = (conn: any) => Promise<T>;

// Haupt-Wrapper-Funktion für Datenbankoperationen
export const withDatabase = async <T>(
  databaseFunction: DatabaseCallback<T>
): Promise<T> => {
  // Wenn wir lokalen Speicher verwenden (nur für Entwicklung/Tests)
  if (useLocalStorage) {
    console.log("Verwendung von lokalem Speicher deaktiviert - Kommunikation mit Backend-Server");
    
    // Wir müssen hier einen API-Endpunkt aufrufen statt localStorage zu nutzen
    // Implementierung des API-Aufrufs würde hier folgen
    throw new Error("Lokale Speicherung ist deaktiviert - Bitte Backend-API verwenden");
  }
  
  // In diesem Fall verwenden wir tatsächlich die Datenbank über das Backend
  // Wir rufen hier den entsprechenden API-Endpunkt auf
  try {
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
