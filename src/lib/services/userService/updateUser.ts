
import { User } from '../../database/models';
import { mapFrontendRoleToMongoRole, withDatabase } from './utils';
import { getUserModel } from '../../database/mongoModels';
import { getUsers } from './getUsers';

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      const UserModel = getUserModel();
      
      // If changing username, check if it's already taken by another user
      if (userData.username) {
        const existingUser = await UserModel.findOne({ 
          username: userData.username,
          _id: { $ne: id }
        }).lean().exec();
        
        if (existingUser) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
      }
      
      // Prepare update data
      const updateData: any = { ...userData };
      
      // If role is being updated, map to MongoDB role format
      if (userData.role) {
        updateData.role = mapFrontendRoleToMongoRole(userData.role);
      }
      
      // Update user
      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean().exec();
      
      if (!updatedUser) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
    },
    // Fallback operation (localStorage)
    async () => {
      try {
        const users = await getUsers();
        const userIndex = users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
          return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        // If changing username, check if it's already taken by another user
        if (userData.username && userData.username !== users[userIndex].username) {
          const usernameExists = users.some(
            user => user.id !== id && user.username === userData.username
          );
          
          if (usernameExists) {
            return { success: false, message: 'Benutzername bereits vergeben' };
          }
        }
        
        // Update user data
        users[userIndex] = {
          ...users[userIndex],
          ...userData
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
      } catch (localStorageError) {
        console.error('Error updating user in localStorage:', localStorageError);
        return { success: false, message: 'Fehler beim Aktualisieren des Benutzers' };
      }
    }
  );
};
