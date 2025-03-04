
import { formatInTimeZone } from 'date-fns-tz';
import { CheckIn } from '../database/models';
import { withDatabase } from '../database/connection';
import { generateCheckInReport } from '../pdfGenerator';
import { getDocuments } from './documentService';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const submitCheckIn = async (data: CheckIn): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    // Zeitstempel mit Berliner Zeitzone erstellen
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Dokumente abrufen
    const documents = await getDocuments();
    
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
    }, documents);
    
    // PDF als Base64 konvertieren für Speicherung in der Datenbank
    const pdfBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString() || '';
        resolve(base64data);
      };
      reader.readAsDataURL(pdfBlob);
    });
    
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

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt
    (db) => {
      console.log("Server-Umgebung: Lade Check-ins aus SQLite");
      
      try {
        const stmt = db.prepare(`
          SELECT id, firstName, lastName, fullName, company, 
                 visitReason, visitDate, visitTime, acceptedRules, 
                 acceptedDocuments, timestamp, timezone, pdfData
          FROM checkins
          ORDER BY timestamp DESC
        `);
        
        const rows = stmt.all();
        
        // Daten für die Clientseite aufbereiten
        return rows.map((row: any) => {
          // Erstelle eine URL für das PDF, wenn PDF-Daten vorhanden sind
          let reportUrl = undefined;
          if (row.pdfData) {
            try {
              // PDF-Daten in Blob umwandeln und URL erstellen
              const pdfDataURL = row.pdfData;
              const byteString = atob(pdfDataURL.split(',')[1]);
              const mimeString = pdfDataURL.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([ab], { type: mimeString });
              reportUrl = URL.createObjectURL(blob);
            } catch (error) {
              console.error('Fehler beim Erstellen der PDF-URL:', error);
            }
          }
          
          return {
            ...row,
            acceptedRules: Boolean(row.acceptedRules),
            acceptedDocuments: JSON.parse(row.acceptedDocuments || '[]'),
            reportUrl
          };
        });
      } catch (error) {
        console.error('Fehler beim Laden der Check-ins aus SQLite:', error);
        return [];
      }
    },
    // Fallback zu localStorage im Browser
    () => {
      console.log("Browser-Umgebung: Lade Check-ins aus localStorage");
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      
      // Für jeden Check-in eine PDF-URL erstellen, wenn PDF-Daten vorhanden sind
      return checkIns.map((checkIn: any) => {
        let reportUrl = undefined;
        if (checkIn.pdfData) {
          try {
            // PDF-Daten in Blob umwandeln und URL erstellen
            const pdfDataURL = checkIn.pdfData;
            const byteString = atob(pdfDataURL.split(',')[1]);
            const mimeString = pdfDataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            reportUrl = URL.createObjectURL(blob);
          } catch (error) {
            console.error('Fehler beim Erstellen der PDF-URL:', error);
          }
        }
        
        return {
          ...checkIn,
          reportUrl
        };
      });
    }
  );
};

// Neue Funktion zum Löschen eines Check-ins
export const deleteCheckIn = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt
    (db) => {
      console.log("Server-Umgebung: Lösche Check-in aus SQLite");
      
      try {
        const stmt = db.prepare('DELETE FROM checkins WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes > 0) {
          return {
            success: true,
            message: "Check-in erfolgreich gelöscht."
          };
        } else {
          return {
            success: false,
            message: "Check-in konnte nicht gefunden werden."
          };
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Check-ins aus SQLite:', error);
        return {
          success: false,
          message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        };
      }
    },
    // Fallback zu localStorage im Browser
    () => {
      console.log("Browser-Umgebung: Lösche Check-in aus localStorage");
      
      try {
        const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
        const index = checkIns.findIndex((checkIn: any) => checkIn.id === id);
        
        if (index !== -1) {
          checkIns.splice(index, 1);
          localStorage.setItem('checkIns', JSON.stringify(checkIns));
          return {
            success: true,
            message: "Check-in erfolgreich gelöscht."
          };
        } else {
          return {
            success: false,
            message: "Check-in konnte nicht gefunden werden."
          };
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Check-ins aus localStorage:', error);
        return {
          success: false,
          message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        };
      }
    }
  );
};
