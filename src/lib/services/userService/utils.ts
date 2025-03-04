
// Browser-Erkennung
export const isBrowser = typeof window !== 'undefined';

// Rollenzuordnungs-Hilfsfunktionen
export const mapDatabaseRoleToFrontendRole = (role: 'ADMIN' | 'USER'): 'admin' | 'user' => {
  return role.toLowerCase() as 'admin' | 'user';
};

export const mapFrontendRoleToDatabaseRole = (role: 'admin' | 'user'): 'ADMIN' | 'USER' => {
  return role.toUpperCase() as 'ADMIN' | 'USER';
};
