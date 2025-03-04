
import { User } from '../../database/models';
import { mapFrontendRoleToDatabaseRole, withDatabase } from './utils';

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    (db) => {
      // If changing username, check if it's already taken by another user
      if (userData.username) {
        const existingUser = db.prepare(`
          SELECT * FROM users WHERE username = ? AND id != ?
        `).get(userData.username, id);
        
        if (existingUser) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
      }
      
      // Get current user data
      const currentUser = db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).get(id);
      
      if (!currentUser) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // Prepare update fields
      const username = userData.username || currentUser.username;
      const password = userData.password || currentUser.password;
      const role = userData.role 
        ? mapFrontendRoleToDatabaseRole(userData.role) 
        : currentUser.role;
      
      // Update user
      db.prepare(`
        UPDATE users
        SET username = ?, password = ?, role = ?
        WHERE id = ?
      `).run(username, password, role, id);
      
      return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
    },
    // Fallback operation (localStorage)
    () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((user: User) => user.id === id);
        
        if (userIndex === -1) {
          return { success: false, message: 'Benutzer nicht gefunden' };
        }
        
        // If changing username, check if it's already taken by another user
        if (userData.username && userData.username !== users[userIndex].username) {
          const usernameExists = users.some(
            (user: User) => user.id !== id && user.username === userData.username
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
