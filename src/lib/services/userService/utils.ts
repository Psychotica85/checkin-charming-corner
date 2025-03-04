
// Browser-Erkennung
export const isBrowser = typeof window !== 'undefined';

// Rollenzuordnungs-Hilfsfunktionen
export const mapDatabaseRoleToFrontendRole = (role: 'ADMIN' | 'USER'): 'admin' | 'user' => {
  return role === 'ADMIN' ? 'admin' : 'user';
};

export const mapFrontendRoleToDatabaseRole = (role: 'admin' | 'user'): 'ADMIN' | 'USER' => {
  return role === 'admin' ? 'ADMIN' : 'USER';
};
