import { User } from '../../database/models';
import { prisma } from '../../database/prisma';
import { mapPrismaRoleToFrontendRole, withDatabase } from './utils';

export const getUsers = async (): Promise<User[]> => {
  return withDatabase(
    // Database operation
    async () => {
      // Check if any users exist
      const count = await prisma.user.count();
      
      // If no users exist, create the default admin user
      if (count === 0) {
        const defaultAdmin = await prisma.user.create({
          data: {
            username: 'admin',
            password: 'admin', // In production, this would be hashed
            role: 'ADMIN',
            createdAt: new Date()
          }
        });
        
        // Return the created admin user with mapped role
        return [{
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          password: defaultAdmin.password,
          role: mapPrismaRoleToFrontendRole(defaultAdmin.role),
          createdAt: defaultAdmin.createdAt.toISOString()
        }];
      }
      
      // Otherwise, return all users
      const users = await prisma.user.findMany();
      
      return users.map(user => ({
        id: user.id,
        username: user.username,
        password: user.password,
        role: mapPrismaRoleToFrontendRole(user.role),
        createdAt: user.createdAt.toISOString()
      }));
    },
    // Fallback operation (localStorage)
    async () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // If no users exist, create the default admin user
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
