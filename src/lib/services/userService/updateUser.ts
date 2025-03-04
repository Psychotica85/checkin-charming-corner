
import { User } from '../../database/models';

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<boolean> => {
  // Diese Funktion ist deaktiviert, da wir nur einen Admin verwenden
  return false;
};
