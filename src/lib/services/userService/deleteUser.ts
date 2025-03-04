
export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  // Diese Funktion ist deaktiviert, da wir nur einen Admin verwenden
  return { 
    success: false, 
    message: 'Die Benutzerverwaltung wurde deaktiviert. Der Admin-Benutzer kann nicht gelöscht werden.' 
  };
};
