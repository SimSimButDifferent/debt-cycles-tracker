// Create a mock for the PrismaClient
import { PrismaClient } from '@prisma/client';

// Use Partial<PrismaClient> to allow for partial implementation
const mockPrisma: Partial<PrismaClient> & {
  $transaction: <T>(fn: (prisma: any) => Promise<T> | T) => Promise<T>;
} = {
  // Mock fredSeries model
  fredSeries: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  
  // Mock cachedFredData model
  cachedFredData: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  
  // Mock lastFetchTimestamp model
  lastFetchTimestamp: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  
  // Mock transaction
  $transaction: jest.fn((callback) => Promise.resolve(callback(mockPrisma))),
  
  // Mock connect/disconnect
  $connect: jest.fn(() => Promise.resolve()),
  $disconnect: jest.fn(() => Promise.resolve()),
};

export { mockPrisma }; 