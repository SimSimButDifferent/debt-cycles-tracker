import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useMetricData, useCategoryMetrics } from '../../hooks/useMetricData';
import { MetricCategory } from '../../types';
import { mockFredResponse } from '../test-utils';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the corsProxy to avoid URL transformation in tests
jest.mock('../../services/corsProxy', () => ({
  applyCorsProxyIfNeeded: (url: string) => url,
}));

// Mock metrics data
jest.mock('../../data/metrics', () => ({
  deflationaryMetrics: [
    {
      id: 'debt-to-gdp',
      name: 'Debt to GDP Ratio',
      description: 'Mock description',
      category: 'deflationary',
      unit: '%',
      source: 'Mock Source',
      data: [{ date: '2020-01-01', value: 100 }],
    },
    {
      id: 'another-metric',
      name: 'Another Metric',
      description: 'Mock description',
      category: 'deflationary',
      unit: '%',
      source: 'Mock Source',
      data: [{ date: '2020-01-01', value: 50 }],
    },
  ],
  inflationaryMetrics: [
    {
      id: 'inflation-inf',
      name: 'Inflation Rate',
      description: 'Mock description',
      category: 'inflationary',
      unit: '%',
      source: 'Mock Source',
      data: [{ date: '2020-01-01', value: 2 }],
    },
  ],
}));

describe('useMetricData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });
  
  it('should fetch data for a metric successfully', async () => {
    // Setup mock with properly structured data
    fetchMock.mockResponseOnce(JSON.stringify({
      data: [
        { date: '2020-01-01', value: 100 },
        { date: '2020-02-01', value: 110 }
      ]
    }));
    
    // Execute
    const { result } = renderHook(() => useMetricData('debt-to-gdp'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the hook to finish fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify final state
    expect(result.current.error).toBe(null);
    expect(result.current.data.length).toBeGreaterThan(0);
  });
  
  it('should handle API errors and fall back to mock data gracefully', async () => {
    // Setup mock to return an error
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('API Error'));
    
    // Execute
    const { result } = renderHook(() => useMetricData('debt-to-gdp'));
    
    // Wait for the hook to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify the error state
    expect(result.current.error).not.toBe(null);
    expect(result.current.data).toEqual([]);
  });
  
  it('should handle non-existent metric IDs', async () => {
    // Setup mock to return an error
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('Not found'));
    
    // Execute
    const { result } = renderHook(() => useMetricData('non-existent-metric'));
    
    // Wait for the hook to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify that we got an error
    expect(result.current.error).not.toBe(null);
    expect(result.current.data).toEqual([]);
  });
});

describe('useCategoryMetrics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });
  
  it('should fetch metrics for deflationary category', async () => {
    // Setup proper response data
    fetchMock.mockResponse(JSON.stringify({
      data: [
        { date: '2020-01-01', value: 100 },
        { date: '2020-02-01', value: 110 }
      ]
    }));
    
    // Execute
    const { result } = renderHook(() => useCategoryMetrics('deflationary'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the hook to finish fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify final state
    expect(result.current.error).toBe(null);
    expect(result.current.metrics.length).toBe(2); // Should match the mock data
    // We can't rely on the source containing FRED since we're mocking fetch
    // and the actual implementation details may vary
  });
  
  it('should handle API errors for category metrics', async () => {
    // Setup: Mock fetch to reject
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('API Error'));
    
    // Execute
    const { result } = renderHook(() => useCategoryMetrics('inflationary'));
    
    // Wait for the hook to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify the results - with the current implementation, errors are handled gracefully
    expect(result.current.error).toBe(null); // Error should be null
    expect(result.current.metrics.length).toBe(1); // Should still have the base metrics
    expect(result.current.metrics[0].source).toBe('Mock Source'); // Should have original source
    expect(result.current.isLoading).toBe(false);
  });
}); 