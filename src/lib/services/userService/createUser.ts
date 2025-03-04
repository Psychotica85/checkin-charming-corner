
import { User } from '../../database/models';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  // Diese Funktion ist deaktiviert, da wir nur einen Admin verwenden
  return { 
    success: false, 
    message: 'Die Benutzerverwaltung wurde deaktiviert. Es ist nur ein Admin-Benutzer verfügbar, der über Umgebungsvariablen konfiguriert wird.' 
  };
};
