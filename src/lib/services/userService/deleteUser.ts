
import { withDatabase } from './utils';

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    (db) => {
      // Get all admin users
      const adminUsers = db.prepare(`
        SELECT * FROM users WHERE role = 'ADMIN'
      `).all();
      
      // Get the user to delete
      const userToDelete = db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).get(id);
      
      if (!userToDelete) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // Prevent deleting the last admin user
      if (userToDelete.role === 'ADMIN' && adminUsers.length <= 1) {
        return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
      }
      
      // Delete the user
      db.prepare(`
        DELETE FROM users WHERE id = ?
      `).run(id);
      
      return { success: true, message: 'Benutzer erfolgreich gelöscht' };
    },
    // Fallback operation (localStorage)
    () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Prevent deleting the last admin user
        const admins = users.filter((user: any) => user.role === 'admin');
        const userToDelete = users.find((user: any) => user.id === id);
        
        if (!userToDelete) {
          return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        if (userToDelete.role === 'admin' && admins.length <= 1) {
          return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
        }
        
        const updatedUsers = users.filter((user: any) => user.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        return { success: true, message: 'Benutzer erfolgreich gelöscht' };
      } catch (localStorageError) {
        console.error('Error deleting user in localStorage:', localStorageError);
        return { success: false, message: 'Fehler beim Löschen des Benutzers' };
      }
    }
  );
};
