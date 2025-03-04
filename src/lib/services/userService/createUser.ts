
import { User } from '../../database/models';
import { mapFrontendRoleToMongoRole, withDatabase } from './utils';
import { getUserModel } from '../../database/mongoModels';
import { getUsers } from './getUsers';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Database operation
    async () => {
      const UserModel = getUserModel();
      
      // Check if username already exists
      const existingUser = await UserModel.findOne({ username: userData.username }).lean().exec();
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
      
      // Map frontend role to MongoDB role
      const mongoRole = mapFrontendRoleToMongoRole(userData.role);
      
      // Create new user
      await new UserModel({
        username: userData.username,
        password: userData.password,
        role: mongoRole,
        createdAt: new Date()
      }).save();
      
      return { success: true, message: 'Benutzer erfolgreich erstellt' };
    },
    // Fallback operation (localStorage)
    async () => {
      try {
        const users = await getUsers();
        
        // Check if username already exists
        if (users.some(user => user.username === userData.username)) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
        
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Benutzer erfolgreich erstellt' };
      } catch (localStorageError) {
        console.error('Error creating user in localStorage:', localStorageError);
        return { success: false, message: 'Fehler beim Erstellen des Benutzers' };
      }
    }
  );
};
