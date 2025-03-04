
import { User } from '../../database/models';
import { mapDatabaseRoleToFrontendRole, withDatabase } from './utils';

export const getUsers = async (): Promise<User[]> => {
  return withDatabase(
    // Datenbankoperation
    (db) => {
      const users = db.prepare(`SELECT * FROM users`).all();
      
      // Standard-Admin-Benutzer erstellen, wenn keine Benutzer existieren
      if (!users || users.length === 0) {
        const defaultAdmin = {
          username: 'admin',
          password: 'admin',
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        };
        
        const result = db.prepare(`
          INSERT INTO users (username, password, role, createdAt)
          VALUES (?, ?, ?, ?)
        `).run(defaultAdmin.username, defaultAdmin.password, defaultAdmin.role, defaultAdmin.createdAt);
        
        return [{
          id: result.lastInsertRowid.toString(),
          username: defaultAdmin.username,
          password: defaultAdmin.password,
          role: mapDatabaseRoleToFrontendRole(defaultAdmin.role as 'ADMIN'),
          createdAt: defaultAdmin.createdAt
        }];
      }
      
      return users.map(user => ({
        id: user.id.toString(),
        username: user.username,
        password: user.password,
        role: mapDatabaseRoleToFrontendRole(user.role as 'ADMIN' | 'USER'),
        createdAt: user.createdAt
      }));
    },
    // Fallback-Operation (localStorage)
    () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Wenn keine Benutzer existieren, Standard-Admin-Benutzer erstellen
      if (users.length === 0) {
        const defaultAdmin = {
          id: '1',
          username: 'admin',
          password: 'admin',
          role: 'admin' as 'admin' | 'user',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        return [defaultAdmin];
      }
      
      return users;
    }
  );
};
