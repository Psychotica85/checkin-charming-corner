
import { withDatabase } from '@/lib/database/connection';

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
