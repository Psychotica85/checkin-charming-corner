
import { formatInTimeZone } from 'date-fns-tz';
import { CheckIn } from '@/lib/database/models';
import { withDatabase } from '@/lib/database/connection';
import { generateCheckInReport } from '@/lib/pdfGenerator';
import { getDocuments } from '../documentService';
import { getCompanySettings } from '../companySettingsService';
import { sendEmailWithPDF } from '../emailService';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const submitCheckIn = async (data: CheckIn): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    // Zeitstempel mit Berliner Zeitzone erstellen
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Dokumente abrufen
    const documents = await getDocuments();
    
    // Unternehmenseinstellungen abrufen
    const companySettings = await getCompanySettings();
    
    // PDF-Bericht generieren
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
    const pdfBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString() || '';
        resolve(base64data);
      };
      reader.readAsDataURL(pdfBlob);
    });
    
    // E-Mail mit PDF-Anhang senden (nur im Node-Umfeld)
    if (!isBrowser) {
      const visitorName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName;
      const emailSubject = `Neuer Besucher-Check-in: ${visitorName} (${data.company})`;
      const pdfFilename = `checkin-${visitorName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
      
      // E-Mail asynchron senden (wir warten nicht auf das Ergebnis, um den Check-in-Prozess nicht zu verlangsamen)
      sendEmailWithPDF(
        emailSubject,
        pdfBase64,
        pdfFilename,
        visitorName,
        data.company,
        data.visitReason || 'Nicht angegeben'
      ).then((emailResult) => {
        console.log('E-Mail-Versandergebnis:', emailResult);
      }).catch((error) => {
        console.error('Fehler beim E-Mail-Versand:', error);
      });
    }
    
    return withDatabase(
      // Diese Funktion wird im Server ausgeführt
      (db) => {
        console.log("Server-Umgebung: Speichere Check-in in SQLite");
        
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
        
        stmt.run(
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
        
        // URL für PDF-Vorschau erstellen
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return { 
          success: true, 
          message: "Check-in erfolgreich gespeichert. Willkommen!",
          reportUrl: pdfUrl
        };
      },
      // Fallback zu localStorage im Browser
      () => {
        console.log("Browser-Umgebung: Speichere Check-in in localStorage");
        const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
        const newCheckIn = {
          id: Date.now().toString(),
          ...data,
          timezone: 'Europe/Berlin',
          timestamp: new Date(berlinTimestamp),
          pdfData: pdfBase64
        };
        checkIns.push(newCheckIn);
        localStorage.setItem('checkIns', JSON.stringify(checkIns));
        
        // URL für PDF-Vorschau im Browser erstellen
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return { 
          success: true, 
          message: "Check-in erfolgreich gespeichert. Willkommen!",
          reportUrl: pdfUrl
        };
      }
    );
  } catch (error) {
    console.error('Error processing check-in:', error);
    return {
      success: false,
      message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    };
  }
};
