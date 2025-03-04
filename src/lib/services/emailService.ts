
import nodemailer from 'nodemailer';
import { PDFDocument } from '../database/models';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } from '../api';

// Transportobjekt für Nodemailer erstellen
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Funktion zum Versenden einer E-Mail mit PDF-Anhang
export const sendCheckInEmail = async (
  checkInData: any, 
  pdfBuffer: Buffer
): Promise<boolean> => {
  try {
    // Mailoptionen konfigurieren
    const mailOptions = {
      from: SMTP_FROM,
      to: SMTP_TO,
      subject: `Neuer Check-In: ${checkInData.fullName} von ${checkInData.company}`,
      text: `
Sehr geehrte Damen und Herren,

ein neuer Besucher hat sich angemeldet:

Name: ${checkInData.fullName}
Firma: ${checkInData.company}
Grund des Besuchs: ${checkInData.visitReason}
Datum: ${new Date(checkInData.visitDate).toLocaleDateString('de-DE')}
Uhrzeit: ${checkInData.visitTime}

Der Besucherausweis wurde dem Besucher ausgestellt.
      `,
      attachments: [
        {
          filename: `check-in-${checkInData.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // E-Mail senden
    const info = await transporter.sendMail(mailOptions);
    console.log('E-Mail gesendet:', info.messageId);
    return true;
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return false;
  }
};

// Funktion, die in checkInService.ts verwendet wird
export const sendEmailWithPDF = async (
  subject: string,
  pdfBase64: string,
  filename: string,
  visitorName: string,
  company: string,
  visitReason: string
): Promise<boolean> => {
  try {
    // Base64-Daten in Buffer umwandeln
    const matches = pdfBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Ungültiges PDF-Format');
    }
    const pdfBuffer = Buffer.from(matches[2], 'base64');

    // Mail-Optionen konfigurieren
    const mailOptions = {
      from: SMTP_FROM,
      to: SMTP_TO,
      subject: subject,
      text: `
Sehr geehrte Damen und Herren,

ein neuer Besucher hat sich angemeldet:

Name: ${visitorName}
Firma: ${company}
Grund des Besuchs: ${visitReason}

Der Besucherausweis wurde dem Besucher ausgestellt.
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // E-Mail senden
    const info = await transporter.sendMail(mailOptions);
    console.log('E-Mail gesendet:', info.messageId);
    return true;
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return false;
  }
};

// Teste SMTP-Verbindung
export const testSMTPConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('SMTP-Verbindung erfolgreich');
    return true;
  } catch (error) {
    console.error('SMTP-Verbindungsfehler:', error);
    return false;
  }
};
