
import * as userService from "@/lib/services/userService";

/**
 * Authentifiziert einen Benutzer
 */
export const authenticateUser = async (username: string, password: string) => {
  try {
    console.log("Authentifizierungsanfrage für:", username);
    
    // Direkte Weiterleitung an den Service
    return await userService.authenticateUser(username, password);
  } catch (error) {
    console.error('API error - authenticateUser:', error);
    return { success: false, message: 'Authentifizierungsfehler' };
  }
};
