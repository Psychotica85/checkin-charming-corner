
import { User } from '../../database/models';

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  // Diese Funktion ist deaktiviert, da wir nur einen Admin verwenden
  return { 
    success: false, 
    message: 'Die Benutzerverwaltung wurde deaktiviert. Die Admin-Anmeldedaten können nur über Umgebungsvariablen geändert werden.' 
  };
};
