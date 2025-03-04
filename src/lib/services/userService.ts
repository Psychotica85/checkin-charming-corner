
// This file now acts as a simple re-export layer to maintain backward compatibility
export { 
  getUsers,
  createUser, 
  updateUser, 
  deleteUser, 
  authenticateUser 
} from './userService/index';
