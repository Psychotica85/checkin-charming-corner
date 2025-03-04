
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
    content?: Buffer;
  }>;
}

// Funktion zum Senden von E-Mails, die in beiden Umgebungen funktioniert
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Überprüfen, ob wir uns im Browser befinden
  if (typeof window !== 'undefined' && window.IS_BROWSER) {
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
