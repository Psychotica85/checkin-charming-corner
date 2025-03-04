
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

// Browser-Erkennung
export const isBrowser = typeof window !== 'undefined';

// Typ-Definitionen für Callback-Funktionen
export type DatabaseCallback<T> = (conn: any) => Promise<T>;

// Haupt-Wrapper-Funktion für Datenbankoperationen
export const withDatabase = async <T>(
  databaseFunction: DatabaseCallback<T>
): Promise<T> => {
  // Im Browser-Kontext verwenden wir localStorage
  if (isBrowser) {
    console.log("Browser-Kontext: Verwende lokalen Speicher statt Datenbank");
    
    // Dummy-Connection-Objekt für Browser
    const browserConnection = {
      query: async (query: string, params?: any[]) => {
        console.log("Browser-DB-Query:", { query, params });
        return [[], []];
      },
      release: () => {}
    };
    
    return await databaseFunction(browserConnection);
  }
  
  // Server-Kontext: Diese Funktion wird im Browser nie aufgerufen
  console.log("Server-Kontext: Führe echte Datenbankoperation durch");
  throw new Error("Server-Kontext-Operationen sollten nicht im Browser aufgerufen werden");
};

// Datenbank-Initialisierung (nur für Browser-Kompatibilität)
export const initializeDatabase = async (): Promise<void> => {
  if (isBrowser) {
    console.log("Browser-Kontext: Initialisiere lokalen Speicher");
    
    // Check-ins initialisieren
    if (!localStorage.getItem('checkIns')) {
      localStorage.setItem('checkIns', JSON.stringify([]));
    }
    
    // Dokumente initialisieren
    if (!localStorage.getItem('pdfDocuments')) {
      localStorage.setItem('pdfDocuments', JSON.stringify([]));
    }
    
    // Unternehmenseinstellungen initialisieren
    if (!localStorage.getItem('companySettings')) {
      const defaultSettings = {
        id: '1',
        address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
        logo: null,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('companySettings', JSON.stringify(defaultSettings));
    }
    
    console.log("Browser-Kontext: Lokaler Speicher initialisiert");
    return;
  }
  
  console.log("Server-Kontext: Datenbankschema wird initialisiert");
  // Diese Funktion wird im Browser-Kontext nie aufgerufen
};
