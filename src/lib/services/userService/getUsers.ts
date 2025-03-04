
import { User } from '../../database/models';
import { isBrowser } from './utils';

// Standard-Admin aus Umgebungsvariablen
const getAdminCredentials = () => {
  const username = isBrowser ? 
    (import.meta.env?.VITE_ADMIN_USERNAME || 'admin') : 
    (process.env?.VITE_ADMIN_USERNAME || 'admin');
    
  return { username };
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const adminCredentials = getAdminCredentials();
    
    // Es gibt nur einen Admin-Benutzer
    const adminUser: User = {
      id: '1',
      username: adminCredentials.username,
      password: '********', // Passwort wird verborgen
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    return [adminUser];
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    return [];
  }
};
