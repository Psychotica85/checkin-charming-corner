
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { withDatabase, initializeDatabase } from './database.js';
import { isSmtpConfigured, SMTP_CONFIG } from './config.js';

// ES Module-Fix für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Router erstellen
const router = express.Router();

// Health-Check-Route
router.get('/api/health', (req, res) => {
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
router.get('/api/test-smtp', async (req, res) => {
  try {
    const nodemailer = await import('nodemailer');
    
    if (!isSmtpConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'SMTP nicht vollständig konfiguriert',
        config: {
          host: SMTP_CONFIG.host || 'nicht gesetzt',
          port: SMTP_CONFIG.port,
          user: SMTP_CONFIG.user || 'nicht gesetzt',
          from: SMTP_CONFIG.from || 'nicht gesetzt',
          to: SMTP_CONFIG.to || 'nicht gesetzt',
          pass: SMTP_CONFIG.pass ? 'gesetzt' : 'nicht gesetzt'
        }
      });
    }
    
    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.port === 465,
      auth: { 
        user: SMTP_CONFIG.user, 
        pass: SMTP_CONFIG.pass 
      },
      tls: { rejectUnauthorized: false },
      debug: true
    });
    
    // Verbindung testen
    await transporter.verify();
    
    // Test-E-Mail senden
    const info = await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to: SMTP_CONFIG.to,
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
router.get('/api/test-db', async (req, res) => {
  try {
    // Datenbankverbindung testen durch Abfrage der Anzahl der Check-ins
    const result = await withDatabase(async (conn) => {
      const [rows] = await conn.query('SELECT COUNT(*) as count FROM checkins');
      return rows;
    }, 'Datenbankabfrage für Testroute');
    
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

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
router.use(express.static(path.join(rootDir, 'dist')));

// Alle Anfragen, die nicht auf statische Dateien zugreifen, an index.html weiterleiten (für SPA)
router.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

export default router;
