
import { User } from '../../database/models';

// Standard-Admin aus Umgebungsvariablen oder Standardwerte
const getAdminCredentials = () => {
  // Standardwerte für Admin-Anmeldedaten aus Umgebungsvariablen
  const username = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
  const password = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
  
  console.log("Admin-Anmeldedaten konfiguriert:", { username });
  return { username, password };
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  try {
    const adminCredentials = getAdminCredentials();
    
    console.log('Authentifizierungsversuch:', { 
      provided: { username }, 
      expected: { username: adminCredentials.username }
    });
    
    // Vergleiche Anmeldedaten case-insensitive für Benutzernamen
    if (username.toLowerCase() === adminCredentials.username.toLowerCase() && 
        password === adminCredentials.password) {
      // Erfolgreiche Anmeldung als Admin
      const adminUser: Omit<User, 'password'> = {
        id: '1',
        username: adminCredentials.username,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      console.log('Anmeldung erfolgreich:', { username });
      
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: adminUser
      };
    }
    
    console.log('Anmeldung fehlgeschlagen für:', { username });
    
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
