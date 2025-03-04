
import { User } from '../../database/models';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

// Standard-Admin aus Umgebungsvariablen oder Standardwerte
const getAdminCredentials = () => {
  // Verwende import.meta.env für Browser und setze Standardwerte
  const username = isBrowser ? 
    (import.meta.env?.VITE_ADMIN_USERNAME || 'admin') : 
    'admin';
    
  const password = isBrowser ? 
    (import.meta.env?.VITE_ADMIN_PASSWORD || 'admin') : 
    'admin';
    
  return { username, password };
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  try {
    const adminCredentials = getAdminCredentials();
    
    console.log('Authentifizierung mit:', { 
      provided: { username, password }, 
      expected: { username: adminCredentials.username }
    });
    
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
