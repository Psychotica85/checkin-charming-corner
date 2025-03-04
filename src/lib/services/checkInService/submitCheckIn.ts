
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
      // Diese Funktion wird im Server ausgeführt
      (db) => {
        console.log("Speichere Check-in in SQLite");
        
        // CheckIn-Daten vorbereiten
        const checkInData = {
          id: Date.now().toString(),
          ...data,
          timezone: 'Europe/Berlin',
          timestamp: berlinTimestamp,
          acceptedDocuments: JSON.stringify(data.acceptedDocuments || []),
          pdfData: pdfBase64
        };
        
        // In SQLite-Datenbank speichern
        const stmt = db.prepare(`
          INSERT INTO checkins (
            id, firstName, lastName, fullName, company, 
            visitReason, visitDate, visitTime, acceptedRules, 
            acceptedDocuments, timestamp, timezone, pdfData
          ) VALUES (
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, ?, ?, ?
          )
        `);
        
        const result = stmt.run(
          checkInData.id,
          checkInData.firstName || null,
          checkInData.lastName || null,
          checkInData.fullName,
          checkInData.company,
          checkInData.visitReason || null,
          checkInData.visitDate ? new Date(checkInData.visitDate).toISOString() : null,
          checkInData.visitTime || null,
          checkInData.acceptedRules ? 1 : 0,
          checkInData.acceptedDocuments,
          checkInData.timestamp,
          checkInData.timezone,
          checkInData.pdfData
        );
        
        console.log("Datenbankoperation erfolgreich:", result);
        
        // URL für PDF-Vorschau erstellen
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // E-Mail-Status in der Rückmeldung angeben
        const emailStatus = emailSent
          ? "E-Mail-Versand erfolgreich."
          : "E-Mail konnte nicht gesendet werden, aber Check-in wurde gespeichert.";
        
        return { 
          success: true, 
          message: `Check-in erfolgreich gespeichert. ${emailStatus} Willkommen!`,
          reportUrl: pdfUrl
        };
      },
      // Browser-Fallback (wird nicht verwendet)
      () => {
        console.error("Kritischer Fehler: Datenbankoperation im Browser nicht möglich");
        throw new Error("Datenbankzugriff im Browser nicht möglich");
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
