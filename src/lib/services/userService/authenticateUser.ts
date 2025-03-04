
import { User } from '../../database/models';
import { prisma } from '../../database/prisma';
import { mapPrismaRoleToFrontendRole, withDatabase } from './utils';
import { getUsers } from './getUsers';

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  return withDatabase(
    // Database operation
    async () => {
      // Find user by username and password
      const user = await prisma.user.findFirst({
        where: { 
          username,
          password 
        }
      });
      
      if (!user) {
        return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
      }
      
      // Return user without password, with mapped role
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: {
          id: user.id,
          username: user.username,
          role: mapPrismaRoleToFrontendRole(user.role),
          createdAt: user.createdAt.toISOString()
        }
      };
    },
    // Fallback operation (localStorage)
    async () => {
      try {
        const users = await getUsers();
        const user = users.find(user => user.username === username && user.password === password);
        
        if (!user) {
          return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        return { 
          success: true, 
          message: 'Anmeldung erfolgreich', 
          user: userWithoutPassword 
        };
      } catch (localStorageError) {
        console.error('Error authenticating user from localStorage:', localStorageError);
        return { success: false, message: 'Fehler bei der Anmeldung' };
      }
    }
  );
};
