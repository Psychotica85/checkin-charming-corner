
import { prisma } from '../../database/prisma';
import { withDatabase } from './utils';
import { getUsers } from './getUsers';

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      });
      
      // Get the user to delete
      const userToDelete = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!userToDelete) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // Prevent deleting the last admin user
      if (userToDelete.role === 'ADMIN' && adminUsers.length <= 1) {
        return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
      }
      
      // Delete the user
      await prisma.user.delete({
        where: { id }
      });
      
      return { success: true, message: 'Benutzer erfolgreich gelöscht' };
    },
    // Fallback operation (localStorage)
    async () => {
      try {
        const users = await getUsers();
        
        // Prevent deleting the last admin user
        const admins = users.filter(user => user.role === 'admin');
        const userToDelete = users.find(user => user.id === id);
        
        if (!userToDelete) {
          return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        if (userToDelete.role === 'admin' && admins.length <= 1) {
          return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
        }
        
        const updatedUsers = users.filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        return { success: true, message: 'Benutzer erfolgreich gelöscht' };
      } catch (localStorageError) {
        console.error('Error deleting user in localStorage:', localStorageError);
        return { success: false, message: 'Fehler beim Löschen des Benutzers' };
      }
    }
  );
};
