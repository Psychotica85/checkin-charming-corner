
import { User } from '../../database/models';
import { mapFrontendRoleToDatabaseRole, withDatabase } from './utils';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    (db) => {
      // Check if username already exists
      const existingUser = db.prepare(`
        SELECT * FROM users WHERE username = ?
      `).get(userData.username);
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
      
      // Map frontend role to database role
      const dbRole = mapFrontendRoleToDatabaseRole(userData.role);
      const createdAt = new Date().toISOString();
      
      // Create new user
      const result = db.prepare(`
        INSERT INTO users (username, password, role, createdAt)
        VALUES (?, ?, ?, ?)
      `).run(userData.username, userData.password, dbRole, createdAt);
      
      return { success: true, message: 'Benutzer erfolgreich erstellt' };
    },
    // Fallback operation (localStorage)
    () => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if username already exists
        if (users.some((user: User) => user.username === userData.username)) {
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
