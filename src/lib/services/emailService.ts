
// E-Mail-Service für das Versenden von PDFs nach Check-in
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } from '../api';

// Diese Funktion prüft, ob die SMTP-Konfiguration vollständig ist
export const isEmailConfigured = (): boolean => {
  return !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM && SMTP_TO);
};

// Diese Funktion sendet eine E-Mail mit PDF-Anhang
export const sendEmailWithPDF = async (
  subject: string,
  pdfData: string,
  pdfFilename: string,
  visitorName: string,
  company: string,
  visitReason: string
): Promise<{ success: boolean; message: string }> => {
  // Wenn wir im Browser sind oder die SMTP-Konfiguration fehlt, wird keine E-Mail gesendet
  if (typeof window !== 'undefined' || !isEmailConfigured()) {
    console.log('E-Mail-Konfiguration fehlt oder wird im Browser ausgeführt, überspringe E-Mail-Versand');
    return {
      success: false,
      message: 'E-Mail-Versand nicht möglich: Konfiguration fehlt oder Browser-Umgebung'
    };
  }

  try {
    // Nur im Node.js-Umfeld ausführen
    const nodemailer = require('nodemailer');
    
    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true für Port 465, false für andere Ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // E-Mail-Text erstellen
    const emailText = `
      Ein neuer Besucher hat sich angemeldet:
      
      Name: ${visitorName}
      Firma: ${company}
      Grund des Besuchs: ${visitReason}
      
      Die vollständigen Details finden Sie im angehängten PDF-Dokument.
    `;

    // E-Mail-HTML erstellen
    const emailHtml = `
      <h2>Neuer Besucher-Check-in</h2>
      <p>Ein neuer Besucher hat sich angemeldet:</p>
      <ul>
        <li><strong>Name:</strong> ${visitorName}</li>
        <li><strong>Firma:</strong> ${company}</li>
        <li><strong>Grund des Besuchs:</strong> ${visitReason}</li>
      </ul>
      <p>Die vollständigen Details finden Sie im angehängten PDF-Dokument.</p>
    `;

    // Das pdfData ist ein base64-codierter String mit dem Datentyp-Präfix, der entfernt werden muss
    const base64Data = pdfData.split(';base64,').pop() || '';

    // E-Mail-Konfiguration
    const mailOptions = {
      from: SMTP_FROM,
      to: SMTP_TO,
      subject,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: pdfFilename,
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    };

    // E-Mail senden
    await transporter.sendMail(mailOptions);
    
    console.log('E-Mail mit PDF erfolgreich gesendet');
    return {
      success: true,
      message: 'E-Mail mit PDF erfolgreich gesendet'
    };
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return {
      success: false,
      message: `E-Mail-Versand fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
    };
  }
};
