// Add custom Jest matchers from jest-dom
import "@testing-library/jest-dom";

// Import chart mocks - Enable this to fix canvas issues
import "./app/__tests__/mocks/chartjs";

// Setup MSW for API mocking
import { server } from "./app/__tests__/mocks/server";

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}));

// Mock Prisma client
jest.mock("./app/database/prisma", () => {
  return {
    prisma: {
      fredSeries: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
      cachedFredData: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
      lastFetchTimestamp: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn((callback) => Promise.resolve(callback({}))),
      $connect: jest.fn(() => Promise.resolve()),
      $disconnect: jest.fn(() => Promise.resolve()),
    },
  };
});

// Mock environment variables
process.env.NEXT_PUBLIC_FRED_API_KEY = "mock-api-key";

// Mock ResizeObserver for chart components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Canvas context for chart.js
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));
