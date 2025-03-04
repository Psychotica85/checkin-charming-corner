
import { withDatabase } from './utils';
import { getUserModel } from '../../database/mongoModels';
import { getUsers } from './getUsers';

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      const UserModel = getUserModel();
      
      // Get all admin users
      const adminUsers = await UserModel.find({ role: 'ADMIN' }).lean().exec();
      
      // Get the user to delete
      const userToDelete = await UserModel.findById(id).lean().exec();
      
      if (!userToDelete) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // Prevent deleting the last admin user
      if (userToDelete.role === 'ADMIN' && adminUsers.length <= 1) {
        return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
      }
      
      // Delete the user
      await UserModel.findByIdAndDelete(id);
      
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
