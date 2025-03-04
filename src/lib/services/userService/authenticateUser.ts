
import { User } from '../../database/models';
import { isBrowser } from './utils';

// Standard-Admin aus Umgebungsvariablen oder Standardwerte
const getAdminCredentials = () => {
  const username = isBrowser ? 
    (import.meta.env?.VITE_ADMIN_USERNAME || 'admin') : 
    (process.env?.VITE_ADMIN_USERNAME || 'admin');
    
  const password = isBrowser ? 
    (import.meta.env?.VITE_ADMIN_PASSWORD || 'admin') : 
    (process.env?.VITE_ADMIN_PASSWORD || 'admin');
    
  return { username, password };
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  try {
    const adminCredentials = getAdminCredentials();
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      // Erfolgreiche Anmeldung als Admin
      const adminUser: Omit<User, 'password'> = {
        id: '1',
        username: adminCredentials.username,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: adminUser
      };
    }
    
    return { 
      success: false, 
      message: 'Ungültiger Benutzername oder Passwort'
    };
  } catch (error) {
    console.error('Fehler bei der Authentifizierung:', error);
    return { 
      success: false, 
      message: 'Fehler bei der Anmeldung'
    };
  }
};
