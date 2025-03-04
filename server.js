
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module-Fix für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS aktivieren
app.use(cors());

// JSON-Parser für Anfragen
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Stelle sicher, dass das Datenverzeichnis existiert
const dataDir = path.join('/app', 'data');
if (!fs.existsSync(dataDir)) {
  console.log(`Erstelle Datenverzeichnis: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
} else {
  console.log(`Datenverzeichnis existiert bereits: ${dataDir}`);
  // Alle Dateien im Verzeichnis anzeigen
  const files = fs.readdirSync(dataDir);
  console.log(`Dateien im Datenverzeichnis: ${files.length > 0 ? files.join(', ') : 'keine'}`);
}

// Teste Schreibberechtigung
try {
  const testFile = path.join(dataDir, 'test.txt');
  fs.writeFileSync(testFile, 'Test Schreibberechtigung');
  console.log(`Schreibtest erfolgreich: ${testFile}`);
  // Datei nach Test löschen
  fs.unlinkSync(testFile);
} catch (error) {
  console.error(`Fehler beim Schreibtest: ${error.message}`);
}

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, 'dist')));

// Health-Check-Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SMTP_HOST: process.env.VITE_SMTP_HOST ? 'gesetzt' : 'nicht gesetzt',
      SMTP_PORT: process.env.VITE_SMTP_PORT,
      SMTP_USER: process.env.VITE_SMTP_USER ? 'gesetzt' : 'nicht gesetzt',
      SMTP_FROM: process.env.VITE_SMTP_FROM
    },
    paths: {
      dataDir,
      cwd: process.cwd(),
      __dirname
    }
  });
});

// API-Routen hier definieren, falls benötigt

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

// Server starten
app.listen(PORT, () => {
  console.log(`\n=== Gäste Check-In System ===`);
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Umgebung: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Admin-Benutzer: ${process.env.VITE_ADMIN_USERNAME || 'admin'}`);
  
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
