
import { User } from '../../database/models';
import { prisma } from '../../database/prisma';
import { mapPrismaRoleToFrontendRole, withDatabase } from './utils';
import { getUserModel } from '../../database/mongoModels';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const getUsers = async (): Promise<User[]> => {
  return withDatabase(
    // Datenbankoperation
    async () => {
      try {
        // Zuerst Prisma versuchen
        // Prüfen, ob Benutzer existieren
        const count = await prisma.user.count();
        
        // Wenn keine Benutzer existieren, Standard-Admin-Benutzer erstellen
        if (count === 0) {
          const defaultAdmin = await prisma.user.create({
            data: {
              username: 'admin',
              password: 'admin', // In Produktion wäre dies gehasht
              role: 'ADMIN',
              createdAt: new Date()
            }
          });
          
          // Erstellten Admin-Benutzer mit zugeordneter Rolle zurückgeben
          return [{
            id: defaultAdmin.id,
            username: defaultAdmin.username,
            password: defaultAdmin.password,
            role: mapPrismaRoleToFrontendRole(defaultAdmin.role),
            createdAt: defaultAdmin.createdAt.toISOString()
          }];
        }
        
        // Sonst alle Benutzer zurückgeben
        const users = await prisma.user.findMany();
        
        return users.map(user => ({
          id: user.id,
          username: user.username,
          password: user.password,
          role: mapPrismaRoleToFrontendRole(user.role),
          createdAt: user.createdAt.toISOString()
        }));
      } catch (prismaError) {
        console.warn('Prisma-Abfrage fehlgeschlagen, verwende MongoDB:', prismaError);
        
        // Fallback: Mit MongoDB versuchen
        const UserModel = getUserModel();
        const count = await UserModel.countDocuments();
        
        // Wenn keine Benutzer existieren, Standard-Admin-Benutzer erstellen
        if (count === 0) {
          const defaultAdmin = await new UserModel({
            username: 'admin',
            password: 'admin', // In Produktion wäre dies gehasht
            role: 'ADMIN',
            createdAt: new Date()
          }).save();
          
          // Erstellten Admin-Benutzer mit zugeordneter Rolle zurückgeben
          return [{
            id: defaultAdmin._id.toString(),
            username: defaultAdmin.username,
            password: defaultAdmin.password,
            role: mapPrismaRoleToFrontendRole(defaultAdmin.role),
            createdAt: defaultAdmin.createdAt.toISOString()
          }];
        }
        
        // Sonst alle Benutzer zurückgeben
        const users = await UserModel.find();
        
        return users.map(user => ({
          id: user._id.toString(),
          username: user.username,
          password: user.password,
          role: mapPrismaRoleToFrontendRole(user.role),
          createdAt: user.createdAt.toISOString()
        }));
      }
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
