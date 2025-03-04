
import { User } from '../../database/models';
import { prisma } from '../../database/prisma';
import { mapFrontendRoleToPrismaRole, withDatabase } from './utils';
import { getUsers } from './getUsers';

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      // If changing username, check if it's already taken by another user
      if (userData.username) {
        const existingUser = await prisma.user.findFirst({
          where: { 
            username: userData.username,
            id: { not: id }
          }
        });
        
        if (existingUser) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
      }
      
      // Prepare update data
      const updateData: any = { ...userData };
      
      // If role is being updated, map to Prisma role format
      if (userData.role) {
        updateData.role = mapFrontendRoleToPrismaRole(userData.role);
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });
      
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
