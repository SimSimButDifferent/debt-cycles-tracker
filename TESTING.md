# Testing Documentation for Debt Cycles Dashboard

This document outlines the testing approach for the Debt Cycles Dashboard application.

## Testing Structure

The test suite is organized as follows:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between components and services
- **API Service Tests**: Specifically test the FRED API integration

## Test Files

The tests are organized in the following directories:

- `app/__tests__/components/`: Tests for React components
- `app/__tests__/hooks/`: Tests for custom React hooks
- `app/__tests__/services/`: Tests for API and data services
- `app/__tests__/mocks/`: Mock setup and handlers for API testing

## Running Tests

To run the tests, use the following npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

1. **API Services**:

   - Fetching data from FRED API
   - Processing data for different metric types
   - Error handling and fallbacks

2. **Custom Hooks**:

   - `useMetricData`: Fetching and processing data for individual metrics
   - `useCategoryMetrics`: Fetching data for categories of metrics

3. **UI Components**:
   - `MetricCard`: Display of metric summary information
   - `MetricDetailModal`: Detailed view of metrics with real-time data integration
   - Loading and error states

## Adding New Tests

When adding new features to the application, follow these guidelines for testing:

1. Create unit tests for any new utility functions
2. Add component tests for UI components
3. Test error handling and edge cases
4. Mock external dependencies

## Troubleshooting

If tests are failing, check for:

1. API key configuration in `.env.local`
2. Mock implementations in `app/__tests__/mocks/handlers.ts`
3. Dependency issues - run `npm install` to ensure all dependencies are installed
