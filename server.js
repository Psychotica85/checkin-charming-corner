
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS aktivieren
app.use(cors());

// JSON-Parser für Anfragen
app.use(express.json());

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, 'dist')));

// Alle Anfragen, die nicht auf statische Dateien zugreifen, an index.html weiterleiten (für SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Umgebung: ${process.env.NODE_ENV}`);
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
});
