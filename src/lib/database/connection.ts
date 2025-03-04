
import { prisma, connectToDatabase, executeQuery } from './prisma';

// Re-export for backward compatibility
export { connectToDatabase, executeQuery };
export default prisma;
