
import { isBrowser } from "./config";
import * as userService from "@/lib/services/userService";

/**
 * Authentifiziert einen Benutzer
 */
export const authenticateUser = async (username: string, password: string) => {
  try {
    // Im Browser-Kontext einfache Demo-Authentifizierung
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für authenticateUser");
      // Demo-Authentifizierung für Entwicklungszwecke
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('authUser', JSON.stringify({ username, role: 'admin' }));
        return { success: true, message: 'Erfolgreich angemeldet', user: { username, role: 'admin' } };
      }
      return { success: false, message: 'Ungültige Anmeldedaten' };
    }
    
    return await userService.authenticateUser(username, password);
  } catch (error) {
    console.error('API error - authenticateUser:', error);
    return { success: false, message: 'Authentifizierungsfehler' };
  }
};
