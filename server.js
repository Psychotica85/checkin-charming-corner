
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

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
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log(`Erstelle Datenverzeichnis: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, 'dist')));

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
    console.log(`SMTP konfiguriert: ${process.env.VITE_SMTP_HOST}`);
  } else {
    console.log('SMTP nicht konfiguriert, E-Mail-Versand wird simuliert');
  }
  
  console.log('\nZugriff auf die Anwendung:');
  console.log(`- Browser: http://localhost:${PORT}`);
  console.log('=====================================\n');
});
