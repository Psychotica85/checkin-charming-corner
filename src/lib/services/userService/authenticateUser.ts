
import { User } from '../../database/models';
import { mapDatabaseRoleToFrontendRole, withDatabase } from './utils';

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  return withDatabase(
    // Database operation
    (db) => {
      // Find user by username and password
      const user = db.prepare(`
        SELECT * FROM users WHERE username = ? AND password = ?
      `).get(username, password);
      
      if (!user) {
        return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
      }
      
      // Return user without password, with mapped role
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: {
          id: user.id.toString(),
          username: user.username,
          role: mapDatabaseRoleToFrontendRole(user.role as 'ADMIN' | 'USER'),
          createdAt: user.createdAt
        }
      };
    },
    // Fallback operation (localStorage)
    () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((user: User) => user.username === username && user.password === password);
        
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
