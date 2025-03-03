import { UserModel, User, IUser } from '../database/models';
import { connectToDatabase } from '../database/connection';

export const getUsers = async (): Promise<User[]> => {
  try {
    await connectToDatabase();
    
    // Check if any users exist
    const count = await UserModel.countDocuments().exec();
    
    // If no users exist, create the default admin user
    if (count === 0) {
      const defaultAdmin = new UserModel({
        username: 'admin',
        password: 'admin', // In production, this would be hashed
        role: 'admin',
        createdAt: new Date()
      });
      
      await defaultAdmin.save();
      
      // Return the created admin user
      return [{
        id: defaultAdmin._id.toString(),
        username: defaultAdmin.username,
        password: defaultAdmin.password,
        role: defaultAdmin.role,
        createdAt: defaultAdmin.createdAt.toISOString()
      }];
    }
    
    // Otherwise, return all users
    // Lösung für TypeScript-Fehler mit 'as any'
    const users = await (UserModel.find().lean() as any).exec();
    
    return users.map((user: any) => ({
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      role: user.role as 'admin' | 'user',
      createdAt: user.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to localStorage if MongoDB fails
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // If no users exist, create the default admin user
    if (users.length === 0) {
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: 'admin',
        role: 'admin' as const,
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
    // Lösung für TypeScript-Fehler mit 'as any'
    const existingUser = await (UserModel.findOne({ username: userData.username }) as any).exec();
    
    if (existingUser) {
      return { success: false, message: 'Benutzername bereits vergeben' };
    }
    
    // Create new user
    const newUser = new UserModel({
      username: userData.username,
      password: userData.password,
      role: userData.role,
      createdAt: new Date()
    });
    
    await newUser.save();
    
    return { success: true, message: 'Benutzer erfolgreich erstellt' };
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Fallback to localStorage if MongoDB fails
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
      // Lösung für TypeScript-Fehler mit 'as any'
      const existingUser = await (UserModel.findOne({ 
        username: userData.username,
        _id: { $ne: id }
      }) as any).exec();
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
    }
    
    // Update user
    // Lösung für TypeScript-Fehler mit 'as any'
    const updatedUser = await (UserModel.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    ) as any).exec();
    
    if (!updatedUser) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Fallback to localStorage if MongoDB fails
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
    // Lösung für TypeScript-Fehler mit 'as any'
    const adminUsers = await (UserModel.find({ role: 'admin' }).lean() as any).exec();
    
    // Get the user to delete
    // Lösung für TypeScript-Fehler mit 'as any'
    const userToDelete = await (UserModel.findById(id).lean() as any).exec();
    
    if (!userToDelete) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    // Prevent deleting the last admin user
    if (userToDelete.role === 'admin' && adminUsers.length <= 1) {
      return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
    }
    
    // Delete the user
    // Lösung für TypeScript-Fehler mit 'as any'
    await (UserModel.findByIdAndDelete(id) as any).exec();
    
    return { success: true, message: 'Benutzer erfolgreich gelöscht' };
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Fallback to localStorage if MongoDB fails
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
    // Lösung für TypeScript-Fehler mit 'as any'
    const user = await (UserModel.findOne({ 
      username: username,
      password: password 
    }).lean() as any).exec();
    
    if (!user) {
      return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
    }
    
    // Return user without password
    return { 
      success: true, 
      message: 'Anmeldung erfolgreich', 
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role as 'admin' | 'user',
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    
    // Fallback to localStorage if MongoDB fails
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
