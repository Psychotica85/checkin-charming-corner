import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { withDatabase, initializeDatabase } from './database.js';
import { isSmtpConfigured, SMTP_CONFIG } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import { generateCheckInReport } from '../dist/lib/pdfGenerator.js';
import { getDocuments } from '../dist/lib/services/documentService.js';
import { sendEmailWithPDF } from '../dist/lib/services/emailService.js';
import { saveCheckIn } from '../lib/services/checkInService';
import { getConfig } from '../lib/api/config';

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
    
    let pdfUrl = null;
    let pdfBase64 = null;
    
    // Dokumente abrufen (für PDF)
    const documents = await getDocuments();
    console.log(`${documents.length} Dokumente für PDF gefunden`);
    
    // Unternehmenseinstellungen abrufen (für PDF)
    let companySettings = null;
    await withDatabase(async (connection) => {
      const [settings] = await connection.query(
        'SELECT * FROM company_settings LIMIT 1'
      );
      if (settings && settings.length > 0) {
        companySettings = settings[0];
        console.log('Unternehmenseinstellungen für PDF geladen');
      }
    });
    
    // PDF generieren
    try {
      console.log('Generiere PDF für Check-in...');
      const checkInData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        visitReason: req.body.visitReason,
        visitDate: new Date(req.body.visitDate),
        visitTime: req.body.visitTime,
        acceptedDocuments: req.body.acceptedDocuments || [],
        timestamp: new Date(req.body.timestamp)
      };
      
      const pdfBlob = await generateCheckInReport(checkInData, documents, companySettings);
      
      // Blob in Base64 konvertieren
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
      
      console.log('PDF erfolgreich generiert');
      
      // PDF-URL setzen (für die Antwort)
      pdfUrl = `/api/reports/${checkInId}`;
      
      // E-Mail mit PDF senden
      try {
        const fullName = `${req.body.firstName} ${req.body.lastName}`;
        const pdfFilename = `checkin-${fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        await sendEmailWithPDF(
          'Neuer Besucher Check-In', 
          pdfBase64,
          pdfFilename,
          fullName,
          req.body.company,
          req.body.visitReason
        );
        
        console.log('E-Mail mit PDF erfolgreich gesendet');
      } catch (emailError) {
        console.error('Fehler beim E-Mail-Versand:', emailError);
        // Fehler beim E-Mail-Versand ignorieren, Check-in trotzdem fortsetzen
      }
      
    } catch (pdfError) {
      console.error('Fehler bei der PDF-Generierung:', pdfError);
      // Trotzdem weitermachen - Check-in speichern ohne PDF
    }
    
    // Check-in in Datenbank speichern
    await withDatabase(async (connection) => {
      console.log('Datenbankverbindung für Speichern eines Check-ins hergestellt');
      
      // Wir generieren den fullName aus firstName und lastName
      const fullName = `${req.body.firstName} ${req.body.lastName}`;
      
      // Check-in-Daten in Datenbank speichern
      const params = [
        checkInId,
        req.body.firstName,
        req.body.lastName,
        fullName,
        req.body.company,
        req.body.visitReason,
        req.body.visitDate,
        req.body.visitTime,
        req.body.acceptedRules ? 1 : 0,
        JSON.stringify(req.body.acceptedDocuments || []),
        req.body.timestamp,
        'UTC',
        pdfBase64 // PDF-Base64-Daten speichern
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
    });
    
    console.log('Speichern eines Check-ins erfolgreich abgeschlossen');
    
    // Antwort senden
    res.status(200).json({
      success: true,
      message: 'Check-in erfolgreich gespeichert',
      checkInId: checkInId,
      reportUrl: pdfUrl
    });
    
  } catch (error) {
    console.error('Fehler bei Speichern eines Check-ins:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Speichern des Check-ins: ' + error.message
    });
  }
});

router.get('/api/checkins', async (req, res) => {
  try {
    console.log('Abrufen aller Check-ins');
    console.log('Starte Abrufen aller Check-ins');
    
    await withDatabase(async (connection) => {
      console.log('Datenbankverbindung für Abrufen aller Check-ins hergestellt');
      
      const [rows] = await connection.query(`
        SELECT id, firstName, lastName, fullName, company, visitReason, 
               visitDate, visitTime, timestamp, acceptedRules, acceptedDocuments
        FROM checkins 
        ORDER BY timestamp DESC
      `);
      
      console.log('Abrufen aller Check-ins erfolgreich abgeschlossen');
      res.json(rows);
    });
    
  } catch (error) {
    console.error('Fehler beim Abrufen aller Check-ins:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Check-ins: ' + error.message
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

// PDF-Bericht-Route hinzufügen
router.get('/api/reports/:id', async (req, res) => {
  try {
    const checkInId = req.params.id;
    console.log(`Anforderung des PDF-Berichts für Check-in ID: ${checkInId}`);
    
    await withDatabase(async (connection) => {
      const [checkins] = await connection.query(
        'SELECT pdfData FROM checkins WHERE id = ?',
        [checkInId]
      );
      
      if (!checkins || checkins.length === 0) {
        console.log(`Check-in mit ID ${checkInId} nicht gefunden`);
        res.status(404).send('Check-in nicht gefunden');
        return;
      }
      
      const checkin = checkins[0];
      
      if (!checkin.pdfData) {
        console.log(`Keine PDF-Daten für Check-in ID ${checkInId} vorhanden`);
        res.status(404).send('PDF nicht gefunden');
        return;
      }
      
      // Base64-Daten extrahieren und als PDF senden
      const base64Data = checkin.pdfData.split(',')[1];
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="checkin-${checkInId}.pdf"`);
      res.send(pdfBuffer);
      
      console.log(`PDF-Bericht für Check-in ID ${checkInId} erfolgreich gesendet`);
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des PDF-Berichts:', error);
    res.status(500).send('Fehler beim Abrufen des PDF-Berichts');
  }
});

// Statische Dateien aus dem dist-Verzeichnis bereitstellen
router.use(express.static(path.join(rootDir, 'dist')));

// Alle Anfragen, die nicht auf statische Dateien zugreifen, an index.html weiterleiten (für SPA)
router.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

export default router;
