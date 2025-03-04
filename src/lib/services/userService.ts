
// Re-export alle notwendigen Funktionen für die Benutzerverwaltung
export { 
  getUsers,
  authenticateUser 
} from './userService/index';

// Diese Funktionen sind jetzt deaktiviert, werden aber noch exportiert, um 
// API-Kompatibilität mit dem Rest der Anwendung zu gewährleisten
export { 
  createUser, 
  updateUser, 
  deleteUser 
} from './userService/index';
