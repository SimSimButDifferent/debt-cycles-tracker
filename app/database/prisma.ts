// This file should only run on the server side
import { PrismaClient } from '@prisma/client';

// Check if code is running on server or client
const isServer = typeof window === 'undefined';

// Only initialize PrismaClient on the server side
let prisma: PrismaClient | undefined;

if (isServer) {
  // PrismaClient is attached to the `global` object in development to prevent
  // exhausting your database connection limit.
  //
  // Learn more: 
  // https://pris.ly/d/help/next-js-best-practices

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} else {
  // In the browser, we don't initialize PrismaClient
  prisma = undefined;
}

export { prisma }; 