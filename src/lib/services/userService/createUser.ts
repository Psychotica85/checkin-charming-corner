
import { User } from '../../database/models';
import { prisma } from '../../database/prisma';
import { mapFrontendRoleToPrismaRole, withDatabase } from './utils';
import { getUsers } from './getUsers';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
      
      // Map frontend role to Prisma role
      const prismaRole = mapFrontendRoleToPrismaRole(userData.role);
      
      // Create new user
      await prisma.user.create({
        data: {
          username: userData.username,
          password: userData.password,
          role: prismaRole,
          createdAt: new Date()
        }
      });
      
      return { success: true, message: 'Benutzer erfolgreich erstellt' };
    },
    // Fallback operation (localStorage)
    async () => {
      try {
        const users = await getUsers();
        
        // Check if username already exists
        if (users.some(user => user.username === userData.username)) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
        
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Benutzer erfolgreich erstellt' };
      } catch (localStorageError) {
        console.error('Error creating user in localStorage:', localStorageError);
        return { success: false, message: 'Fehler beim Erstellen des Benutzers' };
      }
    }
  );
};
