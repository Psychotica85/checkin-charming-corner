
import { IUser, User } from '../database/models';
import { connectToDatabase } from '../database/connection';
import { prisma } from '../database/prisma';

// Hilfsfunktion zur Umwandlung von ADMIN/USER zu admin/user für Frontend-Kompatibilität
const mapPrismaRoleToFrontendRole = (role: 'ADMIN' | 'USER'): 'admin' | 'user' => {
  return role === 'ADMIN' ? 'admin' : 'user';
};

// Hilfsfunktion zur Umwandlung von admin/user zu ADMIN/USER für Prisma-Kompatibilität
const mapFrontendRoleToPrismaRole = (role: 'admin' | 'user'): 'ADMIN' | 'USER' => {
  return role === 'admin' ? 'ADMIN' : 'USER';
};

export const getUsers = async (): Promise<User[]> => {
  try {
    await connectToDatabase();
    
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
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to localStorage if database fails
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // If no users exist, create the default admin user
    if (users.length === 0) {
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    
    return users;
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username }
    });
    
    if (existingUser) {
      return { success: false, message: 'Benutzername bereits vergeben' };
    }
    
    // Map frontend role to Prisma role
    const prismaRole = mapFrontendRoleToPrismaRole(userData.role);
    
    // Create new user
    await prisma.user.create({
      data: {
        username: userData.username,
        password: userData.password,
        role: prismaRole,
        createdAt: new Date()
      }
    });
    
    return { success: true, message: 'Benutzer erfolgreich erstellt' };
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Fallback to localStorage if database fails
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
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // If changing username, check if it's already taken by another user
    if (userData.username) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          username: userData.username,
          id: { not: id }
        }
      });
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
    }
    
    // Prepare update data
    const updateData: any = { ...userData };
    
    // If role is being updated, map to Prisma role format
    if (userData.role) {
      updateData.role = mapFrontendRoleToPrismaRole(userData.role);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    if (!updatedUser) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Fallback to localStorage if database fails
    try {
      const users = await getUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // If changing username, check if it's already taken by another user
      if (userData.username && userData.username !== users[userIndex].username) {
        const usernameExists = users.some(
          user => user.id !== id && user.username === userData.username
        );
        
        if (usernameExists) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
      }
      
      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...userData
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
    } catch (localStorageError) {
      console.error('Error updating user in localStorage:', localStorageError);
      return { success: false, message: 'Fehler beim Aktualisieren des Benutzers' };
    }
  }
};

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userToDelete) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    // Prevent deleting the last admin user
    if (userToDelete.role === 'ADMIN' && adminUsers.length <= 1) {
      return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    });
    
    return { success: true, message: 'Benutzer erfolgreich gelöscht' };
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Fallback to localStorage if database fails
    try {
      const users = await getUsers();
      
      // Prevent deleting the last admin user
      const admins = users.filter(user => user.role === 'admin');
      const userToDelete = users.find(user => user.id === id);
      
      if (!userToDelete) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      if (userToDelete.role === 'admin' && admins.length <= 1) {
        return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
      }
      
      const updatedUsers = users.filter(user => user.id !== id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      return { success: true, message: 'Benutzer erfolgreich gelöscht' };
    } catch (localStorageError) {
      console.error('Error deleting user in localStorage:', localStorageError);
      return { success: false, message: 'Fehler beim Löschen des Benutzers' };
    }
  }
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  try {
    await connectToDatabase();
    
    // Find user by username and password
    const user = await prisma.user.findFirst({
      where: { 
        username,
        password 
      }
    });
    
    if (!user) {
      return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
    }
    
    // Return user without password, with mapped role
    return { 
      success: true, 
      message: 'Anmeldung erfolgreich', 
      user: {
        id: user.id,
        username: user.username,
        role: mapPrismaRoleToFrontendRole(user.role),
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    
    // Fallback to localStorage if database fails
    try {
      const users = await getUsers();
      const user = users.find(user => user.username === username && user.password === password);
      
      if (!user) {
        return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: userWithoutPassword 
      };
    } catch (localStorageError) {
      console.error('Error authenticating user from localStorage:', localStorageError);
      return { success: false, message: 'Fehler bei der Anmeldung' };
    }
  }
};
