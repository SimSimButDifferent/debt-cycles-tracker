// Create a mock for the PrismaClient
import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

// Create a mock for the isClient variable
export const mockIsClient = false;

// Mock implementation of the Prisma client
export const mockPrisma = {
  // Mock fredSeries model
  fredSeries: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  
  // Mock cachedFredData model
  cachedFredData: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
  
  // Mock lastFetchTimestamp model
  lastFetchTimestamp: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  
  // Mock transaction
  $transaction: jest.fn((callback: any) => {
    return callback(mockPrisma);
  }),
  
  // Mock connect/disconnect
  $connect: jest.fn(),
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

// Explicitly indicate this is not undefined
const prisma = mockPrisma as unknown as PrismaClient;

export { mockPrisma, prisma }; 