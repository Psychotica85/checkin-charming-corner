
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './src/lib/database/connection.js';

// ES Module-Fix für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Detaillierte Startinformationen ausgeben
console.log('=====================================');
console.log('=== Besucher Check-In System Server ===');
console.log('Umgebung:', process.env.NODE_ENV || 'development');
console.log('Startzeit:', new Date().toISOString());
console.log('=====================================');

// CORS aktivieren
app.use(cors());

// JSON-Parser für Anfragen
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, 'dist')));

// Health-Check-Route
app.get('/api/health', (req, res) => {
  // Datenbankstatus
  let dbStatus = 'nicht verfügbar';
  
  // SMTP-Konfiguration prüfen
  const smtpConfigured = process.env.VITE_SMTP_HOST && 
                         process.env.VITE_SMTP_USER && 
                         process.env.VITE_SMTP_PASS;
  
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SMTP_HOST: process.env.VITE_SMTP_HOST || 'nicht gesetzt',
      SMTP_PORT: process.env.VITE_SMTP_PORT || 'nicht gesetzt',
      SMTP_USER: process.env.VITE_SMTP_USER || 'nicht gesetzt',
      SMTP_FROM: process.env.VITE_SMTP_FROM || 'nicht gesetzt',
      SMTP_TO: process.env.VITE_SMTP_TO || 'nicht gesetzt',
      SMTP_PASS: process.env.VITE_SMTP_PASS ? 'gesetzt' : 'nicht gesetzt',
      DB_HOST: process.env.DB_HOST || 'nicht gesetzt',
      DB_PORT: process.env.DB_PORT || 'nicht gesetzt',
      DB_USER: process.env.DB_USER || 'nicht gesetzt',
      DB_NAME: process.env.DB_NAME || 'nicht gesetzt'
    }
  });
});

// API-Route für SMTP-Test
app.get('/api/test-smtp', async (req, res) => {
  try {
    const nodemailer = await import('nodemailer');
    
    // SMTP-Konfiguration
    const host = process.env.VITE_SMTP_HOST;
    const port = parseInt(process.env.VITE_SMTP_PORT || '587');
    const user = process.env.VITE_SMTP_USER;
    const pass = process.env.VITE_SMTP_PASS;
    const from = process.env.VITE_SMTP_FROM;
    const to = process.env.VITE_SMTP_TO || from;
    
    if (!host || !user || !pass || !from) {
      return res.status(400).json({
        success: false,
        message: 'SMTP nicht vollständig konfiguriert',
        config: {
          host: host || 'nicht gesetzt',
          port,
          user: user || 'nicht gesetzt',
          from: from || 'nicht gesetzt',
          to: to || 'nicht gesetzt',
          pass: pass ? 'gesetzt' : 'nicht gesetzt'
        }
      });
    }
    
    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      debug: true
    });
    
    // Verbindung testen
    await transporter.verify();
    
    // Test-E-Mail senden
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'SMTP-Testmail vom Besucher Check-In System',
      html: `
        <h2>SMTP-Test erfolgreich</h2>
        <p>Diese E-Mail bestätigt, dass die SMTP-Konfiguration korrekt ist.</p>
        <p>Zeitstempel: ${new Date().toISOString()}</p>
      `
    });
    
    res.json({
      success: true,
      message: 'SMTP-Test erfolgreich',
      info: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('SMTP-Test fehlgeschlagen:', error);
    res.status(500).json({
      success: false,
      message: 'SMTP-Test fehlgeschlagen',
      error: error.message,
      stack: error.stack
    });
  }
});

// API-Route für Datenbanktest
app.get('/api/test-db', async (req, res) => {
  try {
    // Datenbankverbindung testen durch Abfrage der Anzahl der Check-ins
    const { withDatabase } = await import('./src/lib/database/connection.js');
    
    const result = await withDatabase(async (conn) => {
      const [rows] = await conn.query('SELECT COUNT(*) as count FROM checkins');
      return rows;
    });
    
    res.json({
      success: true,
      message: 'Datenbankverbindung erfolgreich',
      data: result
    });
  } catch (error) {
    console.error('Datenbanktest fehlgeschlagen:', error);
    res.status(500).json({
      success: false,
      message: 'Datenbanktest fehlgeschlagen',
      error: error.message,
      stack: error.stack
    });
  }
});

// Alle Anfragen, die nicht auf statische Dateien zugreifen, an index.html weiterleiten (für SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error-Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Interner Serverfehler',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Starte den Server nach Initialisierung der Datenbank
const startServer = async () => {
  try {
    // Initialisiere Datenbankschema
    console.log("Initialisiere Datenbankschema...");
    await initializeDatabase();
    console.log("Datenbankschema erfolgreich initialisiert");
    
    // Starte den Server
    app.listen(PORT, () => {
      console.log(`\n=== Gäste Check-In System ===`);
      console.log(`Server läuft auf Port ${PORT}`);
      console.log(`Umgebung: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Admin-Benutzer: ${process.env.VITE_ADMIN_USERNAME || 'admin'}`);
      
      // Datenbank-Konfiguration überprüfen
      console.log('Datenbank-Konfiguration:');
      console.log(`- Host: ${process.env.DB_HOST || 'mysql'}`);
      console.log(`- Port: ${process.env.DB_PORT || '3306'}`);
      console.log(`- Benutzer: ${process.env.DB_USER || 'checkin'}`);
      console.log(`- Datenbank: ${process.env.DB_NAME || 'checkin_db'}`);
      
      // SMTP-Konfiguration überprüfen
      const smtpConfigured = process.env.VITE_SMTP_HOST && 
                             process.env.VITE_SMTP_USER && 
                             process.env.VITE_SMTP_PASS;
      
      if (smtpConfigured) {
        console.log(`SMTP konfiguriert: ${process.env.VITE_SMTP_HOST}:${process.env.VITE_SMTP_PORT}`);
        console.log(`SMTP Benutzer: ${process.env.VITE_SMTP_USER}`);
        console.log(`E-Mail-Empfänger: ${process.env.VITE_SMTP_TO || 'nicht gesetzt'}`);
      } else {
        console.log('SMTP nicht vollständig konfiguriert:');
        console.log(`- Host: ${process.env.VITE_SMTP_HOST || 'nicht gesetzt'}`);
        console.log(`- Port: ${process.env.VITE_SMTP_PORT || 'nicht gesetzt'}`);
        console.log(`- User: ${process.env.VITE_SMTP_USER || 'nicht gesetzt'}`);
        console.log(`- From: ${process.env.VITE_SMTP_FROM || 'nicht gesetzt'}`);
        console.log(`- To: ${process.env.VITE_SMTP_TO || 'nicht gesetzt'}`);
        console.log('E-Mail-Versand wird simuliert');
      }
      
      console.log('\nZugriff auf die Anwendung:');
      console.log(`- Browser: http://localhost:${PORT}`);
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error("Kritischer Fehler beim Serverstart:", error);
    process.exit(1);
  }
};

// Starte den Server
startServer();
