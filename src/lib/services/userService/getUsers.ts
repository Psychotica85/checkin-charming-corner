
import { User } from '../../database/models';
import { mapMongoRoleToFrontendRole, withDatabase } from './utils';
import { getUserModel } from '../../database/mongoModels';

export const getUsers = async (): Promise<User[]> => {
  return withDatabase(
    // Datenbankoperation
    async () => {
      const UserModel = getUserModel();
      const count = await UserModel.countDocuments().lean().exec();
      
      // Wenn keine Benutzer existieren, Standard-Admin-Benutzer erstellen
      if (count === 0) {
        const defaultAdmin = await new UserModel({
          username: 'admin',
          password: 'admin', // In Produktion wäre dies gehasht
          role: 'ADMIN',
          createdAt: new Date()
        }).save();
        
        return [{
          id: defaultAdmin._id.toString(),
          username: defaultAdmin.username,
          password: defaultAdmin.password,
          role: mapMongoRoleToFrontendRole(defaultAdmin.role),
          createdAt: defaultAdmin.createdAt.toISOString()
        }];
      }
      
      // Sonst alle Benutzer zurückgeben
      const users = await UserModel.find().lean().exec();
      
      return users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        role: mapMongoRoleToFrontendRole(user.role),
        createdAt: user.createdAt.toISOString()
      }));
    },
    // Fallback-Operation (localStorage)
    async () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Wenn keine Benutzer existieren, Standard-Admin-Benutzer erstellen
      if (users.length === 0) {
        const defaultAdmin = {
          id: '1',
          username: 'admin',
          password: 'admin',
          role: 'admin' as 'admin' | 'user',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        return [defaultAdmin];
      }
      
      return users;
    }
  );
};
