
import { CheckIn } from '@/lib/database/models';
import { withDatabase } from '@/lib/database/connection';

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt mit MySQL
    async (conn) => {
      console.log("Lade Check-ins aus MySQL");
      
      try {
        const [rows] = await conn.query(`
          SELECT id, firstName, lastName, fullName, company, 
                 visitReason, visitDate, visitTime, acceptedRules, 
                 acceptedDocuments, timestamp, timezone, pdfData
          FROM checkins
          ORDER BY timestamp DESC
        `);
        
        console.log(`${(rows as any[]).length} Check-ins aus Datenbank geladen`);
        
        // Daten für die Clientseite aufbereiten
        return (rows as any[]).map((row: any) => {
          // Erstelle eine URL für das PDF, wenn PDF-Daten vorhanden sind
          let reportUrl = undefined;
          
          return {
            ...row,
            acceptedRules: Boolean(row.acceptedRules),
            acceptedDocuments: JSON.parse(row.acceptedDocuments || '[]'),
            reportUrl
          };
        });
      } catch (error) {
        console.error('Fehler beim Laden der Check-ins aus MySQL:', error);
        throw error;
      }
    }
  );
};
