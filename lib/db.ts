// Prisma client - optimized for Vercel serverless
// Re-export from lib/prisma.ts for backward compatibility
export { prisma as getDataSource } from './prisma'
export { prisma } from './prisma'

// Legacy compatibility exports
export const AppDataSource = {
  get initialized() {
    return true; // Prisma is always initialized
  },
  async initialize() {
    return prisma;
  }
} as any;

