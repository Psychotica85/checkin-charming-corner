
import { initializeDatabase } from './database.js';

// Serverinitialisierung
export const initializeServer = async () => {
  console.log("Initialisiere Server...");
  
  try {
    // Initialisiere Datenbank
    console.log("Initialisiere Datenbankverbindung und Schema...");
    await initializeDatabase();
    console.log("Datenbankinitialisierung abgeschlossen");
    
    return true;
  } catch (error) {
    console.error("Fehler bei der Serverinitialisierung:", error);
    return false;
  }
};

// Server-Informationen ausgeben
export const logServerInfo = () => {
  const port = process.env.PORT || 3000;
  console.log(`Server läuft auf http://localhost:${port}`);
  console.log("Umgebung: " + (process.env.NODE_ENV || "development"));
  console.log("Datenbank: MySQL auf " + (process.env.DB_HOST || "mysql"));
  
  // SMTP-Konfiguration
  const smtpHost = process.env.VITE_SMTP_HOST;
  if (smtpHost) {
    console.log(`SMTP konfiguriert: ${smtpHost}:${process.env.VITE_SMTP_PORT}`);
  } else {
    console.log("SMTP nicht konfiguriert");
  }
  
  console.log("Besucher Check-In System bereit!");
};
