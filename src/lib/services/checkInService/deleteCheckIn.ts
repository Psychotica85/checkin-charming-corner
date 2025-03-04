
import { withDatabase } from '@/lib/database/connection';

export const deleteCheckIn = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt mit MySQL
    async (conn) => {
      console.log("Lösche Check-in aus MySQL mit ID:", id);
      
      try {
        const [result] = await conn.query('DELETE FROM checkins WHERE id = ?', [id]);
        const affectedRows = (result as any).affectedRows;
        
        if (affectedRows > 0) {
          console.log(`Check-in mit ID ${id} erfolgreich gelöscht`);
          return {
            success: true,
            message: "Check-in erfolgreich gelöscht."
          };
        } else {
          console.log(`Check-in mit ID ${id} nicht gefunden`);
          return {
            success: false,
            message: "Check-in konnte nicht gefunden werden."
          };
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Check-ins aus MySQL:', error);
        throw error;
      }
    }
  );
};
