
import { initializeDatabase } from '../lib/database/connection.js';
import { PORT, NODE_ENV, ADMIN_USERNAME, DB_CONFIG, isSmtpConfigured, SMTP_CONFIG } from './config.js';

// Gibt Serverinformationen aus
export const logServerInfo = () => {
  console.log(`\n=== Gäste Check-In System ===`);
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Umgebung: ${NODE_ENV}`);
  console.log(`Admin-Benutzer: ${ADMIN_USERNAME}`);
  
  // Datenbank-Konfiguration überprüfen
  console.log('Datenbank-Konfiguration:');
  console.log(`- Host: ${DB_CONFIG.host}`);
  console.log(`- Port: ${DB_CONFIG.port}`);
  console.log(`- Benutzer: ${DB_CONFIG.user}`);
  console.log(`- Datenbank: ${DB_CONFIG.database}`);
  
  // SMTP-Konfiguration überprüfen
  if (isSmtpConfigured()) {
    console.log(`SMTP konfiguriert: ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}`);
    console.log(`SMTP Benutzer: ${SMTP_CONFIG.user}`);
    console.log(`E-Mail-Empfänger: ${SMTP_CONFIG.to || 'nicht gesetzt'}`);
  } else {
    console.log('SMTP nicht vollständig konfiguriert:');
    console.log(`- Host: ${SMTP_CONFIG.host || 'nicht gesetzt'}`);
    console.log(`- Port: ${SMTP_CONFIG.port || 'nicht gesetzt'}`);
    console.log(`- User: ${SMTP_CONFIG.user || 'nicht gesetzt'}`);
    console.log(`- From: ${SMTP_CONFIG.from || 'nicht gesetzt'}`);
    console.log(`- To: ${SMTP_CONFIG.to || 'nicht gesetzt'}`);
    console.log('E-Mail-Versand wird nicht funktionieren');
  }
  
  console.log('\nZugriff auf die Anwendung:');
  console.log(`- Browser: http://localhost:${PORT}`);
  console.log('=====================================\n');
};

// Initialisiert den Server (Datenbank, etc.)
export const initializeServer = async () => {
  try {
    // Detaillierte Startinformationen ausgeben
    console.log('=====================================');
    console.log('=== Besucher Check-In System Server ===');
    console.log('Umgebung:', NODE_ENV);
    console.log('Startzeit:', new Date().toISOString());
    console.log('=====================================');
    
    // Initialisiere Datenbankschema
    console.log("Initialisiere Datenbankschema...");
    await initializeDatabase();
    console.log("Datenbankschema erfolgreich initialisiert");
    
    return true;
  } catch (error) {
    console.error("Kritischer Fehler beim Serverstart:", error);
    return false;
  }
};
