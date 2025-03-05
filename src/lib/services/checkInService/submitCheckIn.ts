
// Node-Typen
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

import { formatInTimeZone } from 'date-fns-tz';
import { CheckIn } from '@/lib/database/models';
import { withDatabase } from '@/lib/database/connection';
import { generateCheckInReport } from '@/lib/pdfGenerator';
import { getDocuments } from '../documentService';
import { getCompanySettings } from '../companySettingsService';
import { sendEmailWithPDF } from '../emailService';

// Hauptfunktion zum Einreichen eines Check-ins
export const submitCheckIn = async (data: CheckIn): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in Daten empfangen:', data);
  
  try {
    // Zeitstempel mit Berliner Zeitzone erstellen
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    console.log('Zeitstempel (Berlin):', berlinTimestamp);
    
    // Dokumente abrufen
    console.log('Lade Dokumente...');
    const documents = await getDocuments();
    console.log(`${documents.length} Dokumente geladen`);
    
    // Unternehmenseinstellungen abrufen
    console.log('Lade Unternehmenseinstellungen...');
    const companySettings = await getCompanySettings();
    
    // PDF-Bericht generieren
    console.log('Generiere PDF-Bericht...');
    const pdfBlob = await generateCheckInReport({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company,
      visitReason: data.visitReason || '',
      visitDate: data.visitDate instanceof Date ? data.visitDate : new Date(data.visitDate || ''),
      visitTime: data.visitTime || '',
      acceptedDocuments: data.acceptedDocuments || [],
      timestamp: new Date(berlinTimestamp)
    }, documents, companySettings);
    
    // PDF als Base64 konvertieren für Speicherung in der Datenbank
    console.log('Konvertiere PDF für Speicherung...');
    const pdfBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString() || '';
        resolve(base64data);
      };
      reader.readAsDataURL(pdfBlob);
    });
    
    // E-Mail mit PDF-Anhang senden (im Node-Umfeld)
    console.log('Bereite E-Mail-Versand vor...');
    const visitorName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName;
    const emailSubject = process.env.VITE_SMTP_SUBJECT || `Neuer Besucher-Check-in: ${visitorName} (${data.company})`;
    const pdfFilename = `checkin-${visitorName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
    
    console.log('E-Mail wird vorbereitet:');
    console.log('- Betreff:', emailSubject);
    console.log('- Dateiname:', pdfFilename);
    
    let emailSent = false;
    try {
      // E-Mail senden und auf Ergebnis warten
      console.log('Sende E-Mail...');
      emailSent = await sendEmailWithPDF(
        emailSubject,
        pdfBase64,
        pdfFilename,
        visitorName,
        data.company,
        data.visitReason || 'Nicht angegeben'
      );
      
      console.log('E-Mail-Versand erfolgreich:', emailSent);
    } catch (emailError) {
      console.error('Fehler beim E-Mail-Versand (wird fortgesetzt):', emailError);
      // E-Mail-Fehler verhindern nicht das Speichern des Check-ins
    }
    
    console.log('Speichere Check-in in der Datenbank...');
    return withDatabase(
      // Diese Funktion wird im Server ausgeführt mit MySQL
      async (conn) => {
        console.log("Speichere Check-in in MySQL");
        
        // Generiere eine eindeutige ID für den Check-in
        const checkInId = `checkin-${Date.now()}`;
        console.log("Generierte ID für Check-in:", checkInId);
        
        // CheckIn-Daten vorbereiten
        const checkInData = {
          id: checkInId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          company: data.company,
          visitReason: data.visitReason || '',
          visitDate: data.visitDate,
          visitTime: data.visitTime || '',
          acceptedRules: data.acceptedRules ? 1 : 0,
          acceptedDocuments: JSON.stringify(data.acceptedDocuments || []),
          timestamp: berlinTimestamp,
          timezone: 'Europe/Berlin',
          pdfData: pdfBase64
        };
        
        console.log("SQL-Parameter für Check-in:", [
          checkInData.id,
          checkInData.firstName,
          checkInData.lastName,
          checkInData.company,
          checkInData.visitReason,
          checkInData.visitDate ? new Date(checkInData.visitDate).toISOString().split('T')[0] : null,
          checkInData.visitTime,
          checkInData.acceptedRules,
          checkInData.acceptedDocuments,
          checkInData.timestamp,
          checkInData.timezone,
          checkInData.pdfData
        ]);
        
        // In MySQL-Datenbank speichern
        await conn.query(`
          INSERT INTO checkins (
            id, firstName, lastName, company, 
            visitReason, visitDate, visitTime, acceptedRules, 
            acceptedDocuments, timestamp, timezone, pdfData
          ) VALUES (
            ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, ?, ?, ?
          )
        `, [
          checkInData.id,
          checkInData.firstName,
          checkInData.lastName,
          checkInData.company,
          checkInData.visitReason,
          checkInData.visitDate ? new Date(checkInData.visitDate).toISOString().split('T')[0] : null,
          checkInData.visitTime,
          checkInData.acceptedRules,
          checkInData.acceptedDocuments,
          checkInData.timestamp,
          checkInData.timezone,
          checkInData.pdfData
        ]);
        
        console.log("Datenbankoperation erfolgreich");
        
        // URL für PDF-Vorschau erstellen - nur im Browser-Kontext
        const isBrowser = typeof window !== 'undefined';
        let pdfUrl = '';
        if (isBrowser) {
          try {
            pdfUrl = URL.createObjectURL(pdfBlob);
            console.log("PDF-URL für Browservorschau erstellt:", pdfUrl);
          } catch (urlError) {
            console.error("Fehler beim Erstellen der PDF-URL:", urlError);
          }
        }
        
        // E-Mail-Status in der Rückmeldung angeben
        const emailStatus = emailSent
          ? "E-Mail-Versand erfolgreich."
          : "E-Mail konnte nicht gesendet werden, aber Check-in wurde gespeichert.";
        
        return { 
          success: true, 
          message: `Check-in erfolgreich gespeichert. ${emailStatus} Willkommen!`,
          reportUrl: pdfUrl
        };
      }
    );
  } catch (error) {
    console.error('Kritischer Fehler bei Check-in:', error);
    console.error('Stack-Trace:', error.stack);
    return {
      success: false,
      message: `Ein Fehler ist aufgetreten: ${error.message}`
    };
  }
};
