import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { withDatabase, initializeDatabase } from './database.js';
import { isSmtpConfigured, SMTP_CONFIG } from './config.js';
import { v4 as uuidv4 } from 'uuid';

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

// API-Route für Check-In-Operationen
router.post('/api/checkin', async (req, res) => {
  try {
    console.log('Check-in API aufgerufen mit:', req.body);
    
    // UUID für Check-in generieren
    const checkInId = uuidv4();
    console.log(`UUID für Check-in generiert: ${checkInId}`);
    
    // Starte Speichern eines Check-ins
    console.log('Starte Speichern eines Check-ins');
    
    await withDatabase(async (connection) => {
      console.log('Datenbankverbindung für Speichern eines Check-ins hergestellt');
      
      // Wir generieren den fullName aus firstName und lastName
      const fullName = `${req.body.firstName} ${req.body.lastName}`;
      
      // Check-in-Daten in Datenbank speichern
      const params = [
        checkInId,
        req.body.firstName,
        req.body.lastName,
        fullName,              // Hier wird fullName explizit übergeben
        req.body.company,
        req.body.visitReason,
        req.body.visitDate,
        req.body.visitTime,
        req.body.acceptedRules ? 1 : 0,
        JSON.stringify(req.body.acceptedDocuments || []),
        req.body.timestamp,
        'UTC',                 // Zeitzone
        null                   // PDF-Daten werden später generiert
      ];
      
      console.log('SQL-Parameter für Check-in:', params);
      
      // WICHTIG: fullName in die SQL-Abfrage aufnehmen
      await connection.query(
        `INSERT INTO checkins (
          id, firstName, lastName, fullName, company, visitReason, 
          visitDate, visitTime, acceptedRules, acceptedDocuments, 
          timestamp, timezone, pdfData
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );
      
      console.log(`Check-in mit ID ${checkInId} erfolgreich gespeichert`);
      
      return { success: true, id: checkInId };
    }, 'Speichern eines Check-ins');
    
    res.json({
      success: true,
      message: 'Check-in erfolgreich gespeichert',
      data: result
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Check-ins:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Speichern des Check-ins: ${error.message}` 
    });
  }
});

router.get('/api/checkins', async (req, res) => {
  try {
    console.log('Abrufen aller Check-ins');
    
    const checkins = await withDatabase(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM checkins ORDER BY timestamp DESC');
      return rows;
    }, 'Abrufen aller Check-ins');
    
    res.json(checkins);
  } catch (error) {
    console.error('Fehler beim Abrufen der Check-ins:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Abrufen der Check-ins: ${error.message}` 
    });
  }
});

router.delete('/api/checkin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Lösche Check-in mit ID: ${id}`);
    
    const result = await withDatabase(async (conn) => {
      await conn.query('DELETE FROM checkins WHERE id = ?', [id]);
      return { success: true, id };
    }, 'Löschen eines Check-ins');
    
    res.json({
      success: true,
      message: 'Check-in erfolgreich gelöscht',
      data: result
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Check-ins:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Löschen des Check-ins: ${error.message}` 
    });
  }
});

// API-Route für Unternehmenseinstellungen
router.get('/api/company-settings', async (req, res) => {
  try {
    console.log('Abrufen der Unternehmenseinstellungen');
    
    const settings = await withDatabase(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM company_settings LIMIT 1');
      return rows[0] || null;
    }, 'Abrufen der Unternehmenseinstellungen');
    
    res.json(settings);
  } catch (error) {
    console.error('Fehler beim Abrufen der Unternehmenseinstellungen:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Abrufen der Unternehmenseinstellungen: ${error.message}` 
    });
  }
});

router.post('/api/company-settings', async (req, res) => {
  try {
    console.log('Update der Unternehmenseinstellungen:', req.body);
    
    // Starte Aktualisieren der Unternehmenseinstellungen
    console.log('Starte Aktualisieren der Unternehmenseinstellungen');
    
    await withDatabase(async (connection) => {
      // Entferne 'name' aus dem UPDATE-Statement, wenn es nicht in der Tabelle existiert
      await connection.query(
        `UPDATE company_settings SET 
         address = ?, 
         logo = ?, 
         updatedAt = ? 
         WHERE id = ?`,
        [
          req.body.address || '',
          req.body.logo || '',
          new Date().toISOString(),
          req.body.id
        ]
      );
      
      console.log('Unternehmenseinstellungen erfolgreich aktualisiert');
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Unternehmenseinstellungen:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Aktualisieren der Unternehmenseinstellungen: ${error.message}` 
    });
  }
});

// API-Route für Dokumente
router.get('/api/documents', async (req, res) => {
  try {
    console.log('Abrufen aller Dokumente');
    
    const documents = await withDatabase(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM documents ORDER BY createdAt DESC');
      return rows;
    }, 'Abrufen aller Dokumente');
    
    res.json(documents);
  } catch (error) {
    console.error('Fehler beim Abrufen der Dokumente:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Abrufen der Dokumente: ${error.message}` 
    });
  }
});

router.post('/api/document', async (req, res) => {
  try {
    console.log('Speichern eines Dokuments:', req.body.name);
    
    const documentData = req.body;
    const result = await withDatabase(async (conn) => {
      await conn.query(
        'INSERT INTO documents (id, name, description, file, createdAt) VALUES (?, ?, ?, ?, ?)',
        [
          documentData.id,
          documentData.name,
          documentData.description,
          documentData.file,
          documentData.createdAt || new Date().toISOString()
        ]
      );
      
      return { success: true, id: documentData.id };
    }, 'Speichern eines Dokuments');
    
    res.json({
      success: true,
      message: 'Dokument erfolgreich gespeichert',
      data: result
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Dokuments:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Speichern des Dokuments: ${error.message}` 
    });
  }
});

router.delete('/api/document/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Lösche Dokument mit ID: ${id}`);
    
    const result = await withDatabase(async (conn) => {
      await conn.query('DELETE FROM documents WHERE id = ?', [id]);
      return { success: true, id };
    }, 'Löschen eines Dokuments');
    
    res.json({
      success: true,
      message: 'Dokument erfolgreich gelöscht',
      data: result
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Dokuments:', error);
    res.status(500).json({ 
      success: false, 
      message: `Fehler beim Löschen des Dokuments: ${error.message}` 
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
