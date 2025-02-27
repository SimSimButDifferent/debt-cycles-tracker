import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useMetricData, useCategoryMetrics } from '../../hooks/useMetricData';
import { MetricCategory } from '../../types';
import { mockFredResponse } from '../test-utils';

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
  });
  
  it('should fetch data for a metric successfully', async () => {
    // Setup
    mockedAxios.get.mockResolvedValueOnce({ data: mockFredResponse });
    
    // Execute
    const { result } = renderHook(() => useMetricData('debt-to-gdp'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    // The metric will be set to the base metric early, so we no longer check for null
    
    // Wait for the hook to finish fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify final state
    expect(result.current.error).toBe(null);
    expect(result.current.metric).not.toBe(null);
    expect(result.current.metric?.id).toBe('debt-to-gdp');
    expect(result.current.metric?.source).toContain('FRED');
  });
  
  it('should handle API errors and fall back to mock data gracefully', async () => {
    // Setup
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    
    // Execute
    const { result } = renderHook(() => useMetricData('debt-to-gdp'));
    
    // Wait for the hook to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify that we have fallback data and the error is null
    // The hook now handles API errors gracefully without setting error state
    expect(result.current.error).toBe(null); // Updated to match new behavior
    expect(result.current.status).toBe('success'); // Status should be success
    expect(result.current.metric).not.toBe(null);
    expect(result.current.metric?.source).toBe('Mock Source'); // Should be the original mock source
  });
  
  it('should handle non-existent metric IDs', async () => {
    // Execute
    const { result } = renderHook(() => useMetricData('non-existent-metric'));
    
    // Wait for the hook to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify that we got an error
    expect(result.current.error).not.toBe(null);
    expect(result.current.metric).toBe(null);
  });
});

describe('useCategoryMetrics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch metrics for deflationary category', async () => {
    // Setup
    mockedAxios.get.mockResolvedValue({ data: mockFredResponse });
    
    // Execute
    const { result } = renderHook(() => useCategoryMetrics('deflationary'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the hook to finish fetching
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify final state
    expect(result.current.error).toBe(null);
    expect(result.current.metrics.length).toBe(2); // Should match the mock data
    expect(result.current.metrics[0].source).toContain('FRED'); // Should have updated source
  });
  
  it('should handle API errors for category metrics', async () => {
    // Setup: Mock axios to reject
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
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