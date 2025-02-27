# Testing Guide

This document provides information about the testing setup for the Debt Cycles Dashboard.

## Test Overview

The application includes several types of tests:

- Unit tests for individual components and functions
- Integration tests for services like the FRED API and database
- Mock implementations for external dependencies

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Database-Specific Tests

```bash
./scripts/test-database.sh
```

## Test Structure

Tests are organized in the following directories:

- `app/__tests__/components/` - Component tests
- `app/__tests__/hooks/` - React hook tests
- `app/__tests__/services/` - API service tests
- `app/__tests__/database/` - Database service tests
- `app/__tests__/integration/` - Integration tests
- `app/__tests__/mocks/` - Mock implementations and helpers

## Mock Implementations

The test suite uses several mock implementations:

### Prisma Client

The Prisma client is mocked in `jest.setup.js` to avoid actual database connections during tests. It provides mock implementations for all the database operations used in the application.

### FRED API

API calls to the FRED service are mocked using:

- Mock Service Worker (MSW) for HTTP request interception
- Mock responses in `app/__tests__/mocks/fredApiResponses.ts`

### React Components

UI components are tested using:

- React Testing Library for component rendering and interactions
- Jest DOM matchers for assertions

## Database Testing

The database tests verify that:

1. Data can be cached correctly
2. The system properly determines when to refresh data
3. Cached data is returned when available
4. API calls are made only when necessary

## Writing New Tests

When writing new tests:

1. Place tests in the appropriate directory based on what you're testing
2. Follow the naming convention: `*.test.ts` or `*.test.tsx`
3. Use existing mocks or create new ones as needed
4. Keep tests focused on a single responsibility

## Troubleshooting Tests

If tests are failing:

1. Check that environment variables are properly mocked
2. Verify mock implementations match the current code structure
3. Look for timing issues with asynchronous operations
4. Ensure the test environment is properly set up in `jest.setup.js`
