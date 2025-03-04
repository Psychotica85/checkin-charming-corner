
/**
 * E-Mail-Service zur Verwendung im Server
 * Im Browser wird ein Fehler geworfen, da E-Mail-Versand nur auf dem Server funktionieren soll
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

// Funktion zum Senden von E-Mails, die nur im Server funktioniert
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Überprüfen, ob wir uns im Browser befinden
  if (typeof window !== 'undefined') {
    console.error('FEHLER: E-Mail-Versand ist nur auf dem Server möglich.');
    throw new Error('E-Mail-Versand im Browser nicht möglich');
  }

  try {
    // Server-Umgebung: Nodemailer verwenden
    const nodemailer = await import('nodemailer');
    
    // SMTP-Konfiguration aus Umgebungsvariablen
    const host = process.env.VITE_SMTP_HOST;
    const port = parseInt(process.env.VITE_SMTP_PORT || '587');
    const user = process.env.VITE_SMTP_USER;
    const pass = process.env.VITE_SMTP_PASS;
    const from = process.env.VITE_SMTP_FROM;
    
    console.log('SMTP-Konfiguration:', { 
      host, 
      port, 
      user, 
      from,
      pass: pass ? '(gesetzt)' : '(nicht gesetzt)'
    });
    
    // Wenn keine SMTP-Konfiguration vorhanden ist, Fehler werfen
    if (!host || !user || !pass || !from) {
      const errorMsg = 'Unvollständige SMTP-Konfiguration';
      console.error(errorMsg + ':');
      console.error('- SMTP_HOST:', host || 'nicht gesetzt');
      console.error('- SMTP_PORT:', port);
      console.error('- SMTP_USER:', user || 'nicht gesetzt');
      console.error('- SMTP_PASS:', pass ? 'gesetzt' : 'nicht gesetzt');
      console.error('- SMTP_FROM:', from || 'nicht gesetzt');
      
      throw new Error(errorMsg);
    }
    
    // Transporter mit detaillierter Konfiguration
    const transporterOptions = {
      host,
      port,
      secure: port === 465, // true für 465, false für andere Ports
      auth: {
        user,
        pass
      },
      tls: {
        // TLS-Konfiguration für bessere Kompatibilität
        rejectUnauthorized: false
      },
      debug: true,
      logger: true // Aktiviert detailliertes Logging
    };
    
    console.log('Initialisiere SMTP-Transporter mit:', JSON.stringify({
      ...transporterOptions,
      auth: { user, pass: '***' }
    }));
    
    const transporter = nodemailer.createTransport(transporterOptions);
    
    // Überprüfen, ob Verbindung hergestellt werden kann
    console.log('Überprüfe SMTP-Verbindung...');
    try {
      const verifyResult = await transporter.verify();
      console.log('SMTP-Verbindung erfolgreich hergestellt:', verifyResult);
    } catch (verifyError) {
      console.error('SMTP-Verbindungstest fehlgeschlagen:', verifyError);
      throw new Error(`SMTP-Verbindung fehlgeschlagen: ${verifyError.message}`);
    }
    
    // E-Mail mit detailliertem Logging senden
    console.log('Sende E-Mail an:', options.to);
    console.log('E-Mail-Betreff:', options.subject);
    console.log('Anzahl der Anhänge:', options.attachments?.length || 0);
    
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments
    });
    
    console.log('E-Mail erfolgreich gesendet:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });
    
    return true;
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    console.error('Stack-Trace:', error.stack);
    throw error; // Fehler weiterleiten statt false zurückzugeben
  }
};

/**
 * Sendet eine E-Mail mit PDF-Anhang
 */
export const sendEmailWithPDF = async (
  subject: string,
  pdfBase64: string,
  filename: string,
  visitorName: string,
  company: string,
  reason: string
): Promise<boolean> => {
  try {
    console.log(`Versuche E-Mail zu senden für Besucher: ${visitorName}`);
    
    // Empfänger-E-Mail aus Umgebungsvariablen
    const recipientEmail = process.env.VITE_SMTP_TO || process.env.VITE_SMTP_FROM;
    
    if (!recipientEmail) {
      throw new Error('Kein E-Mail-Empfänger konfiguriert (VITE_SMTP_TO oder VITE_SMTP_FROM)');
    }
    
    console.log('E-Mail-Empfänger:', recipientEmail);
    
    // HTML-Inhalt der E-Mail
    const htmlContent = `
      <h2>Neuer Besucher-Check-in</h2>
      <p>Ein neuer Besucher hat sich angemeldet:</p>
      <table border="0" cellpadding="5" style="border-collapse: collapse;">
        <tr>
          <td><strong>Name:</strong></td>
          <td>${visitorName}</td>
        </tr>
        <tr>
          <td><strong>Firma:</strong></td>
          <td>${company}</td>
        </tr>
        <tr>
          <td><strong>Grund:</strong></td>
          <td>${reason}</td>
        </tr>
        <tr>
          <td><strong>Zeitpunkt:</strong></td>
          <td>${new Date().toLocaleString('de-DE')}</td>
        </tr>
      </table>
      <p>Weitere Details finden Sie im angehängten PDF-Dokument.</p>
    `;
    
    // PDF-Daten für den Anhang vorbereiten
    const contentBuffer = Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
    
    // E-Mail mit Anhang senden
    return await sendEmail({
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: filename,
          content: contentBuffer
        }
      ]
    });
  } catch (error) {
    console.error('Fehler beim Erstellen/Senden der E-Mail mit PDF-Anhang:', error);
    console.error('Stack-Trace:', error.stack);
    throw error; // Fehler weiterleiten statt false zurückzugeben
  }
};
