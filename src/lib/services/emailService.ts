
/**
 * E-Mail-Service zur Verwendung im Browser und Server
 * 
 * Im Browser: Simuliert E-Mail-Versand mit Konsolen-Logs
 * Auf dem Server: Verwendet Nodemailer für tatsächlichen E-Mail-Versand
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

// Flag für Browser-Umgebung
const isBrowser = typeof window !== 'undefined';

// Funktion zum Senden von E-Mails, die in beiden Umgebungen funktioniert
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Überprüfen, ob wir uns im Browser befinden
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt: E-Mail-Versand wird simuliert');
    console.log('E-Mail würde gesendet werden an:', options.to);
    console.log('Betreff:', options.subject);
    console.log('Anzahl der Anhänge:', options.attachments?.length || 0);
    
    // Simuliere erfolgreichen E-Mail-Versand im Browser
    return true;
  } else {
    try {
      // Server-Umgebung: Nodemailer verwenden (wird asynchron importiert, um Browser-Fehler zu vermeiden)
      const nodemailer = await import('nodemailer');
      
      // SMTP-Konfiguration aus Umgebungsvariablen
      const host = process.env.VITE_SMTP_HOST;
      const port = parseInt(process.env.VITE_SMTP_PORT || '587');
      const user = process.env.VITE_SMTP_USER;
      const pass = process.env.VITE_SMTP_PASS;
      const from = process.env.VITE_SMTP_FROM;
      
      // Wenn keine SMTP-Konfiguration vorhanden ist, Fehler loggen und simulieren
      if (!host || !user || !pass || !from) {
        console.warn('Keine vollständige SMTP-Konfiguration gefunden, E-Mail-Versand wird simuliert');
        console.log('E-Mail würde gesendet werden an:', options.to);
        console.log('Betreff:', options.subject);
        return true;
      }
      
      // Transporter konfigurieren
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      });
      
      // E-Mail senden
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments
      });
      
      console.log('E-Mail erfolgreich gesendet an:', options.to);
      return true;
    } catch (error) {
      console.error('Fehler beim E-Mail-Versand:', error);
      return false;
    }
  }
};

/**
 * Sendet eine E-Mail mit PDF-Anhang
 * @param subject Betreff der E-Mail
 * @param pdfBase64 PDF als Base64-String
 * @param filename Dateiname des PDF-Anhangs
 * @param visitorName Name des Besuchers
 * @param company Firma des Besuchers
 * @param reason Besuchsgrund
 * @returns Promise mit Ergebnis des E-Mail-Versands (true = erfolgreich, false = fehlgeschlagen)
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
    
    // Empfänger-E-Mail aus Umgebungsvariablen oder Fallback
    const recipientEmail = isBrowser 
      ? 'empfaenger@example.com' 
      : (process.env.VITE_SMTP_TO || 'empfaenger@example.com');
    
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
    const contentBuffer = typeof Buffer !== 'undefined' 
      ? Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
      : pdfBase64;
    
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
    return false;
  }
};
