import axios from 'axios';
import { fetchFredData, FRED_SERIES_INFO } from '../../services/fredApi';
import { getCachedFredData, shouldFetchFromApi, cacheFredData } from '../../database/fredDataService';
import { DataPoint } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the database service
jest.mock('../../database/fredDataService', () => ({
  getCachedFredData: jest.fn(),
  cacheFredData: jest.fn(),
  shouldFetchFromApi: jest.fn()
}));

// Mock the corsProxy service
jest.mock('../../services/corsProxy', () => ({
  applyCorsProxyIfNeeded: jest.fn((url) => url)
}));

describe('FRED API Service with Cache', () => {
  const mockSeriesId = 'GDPC1';
  const mockApiKey = 'test-api-key';
  const mockData = [
    { date: '2023-01-01', value: 100 },
    { date: '2023-02-01', value: 101 },
    { date: '2023-03-01', value: 102 },
  ];
  
  const mockApiResponse = {
    data: {
      observations: [
        { date: '2022-01-01', value: '10' },
        { date: '2022-02-01', value: '11' },
        { date: '2022-03-01', value: '12' }
      ]
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set environment variable
    process.env.NEXT_PUBLIC_FRED_API_KEY = mockApiKey;
  });
  
  afterEach(() => {
    // Clean up
    delete process.env.NEXT_PUBLIC_FRED_API_KEY;
  });
  
  it('should return cached data if available and not stale', async () => {
    // Setup mocks
    (getCachedFredData as jest.Mock).mockResolvedValue(mockData);
    (shouldFetchFromApi as jest.Mock).mockResolvedValue(false);
    
    // Call the function
    const result = await fetchFredData(mockSeriesId);
    
    // Verify results
    expect(result).toEqual(mockData);
    
    // Verify that getCachedFredData was called
    expect(getCachedFredData).toHaveBeenCalledWith(mockSeriesId);
    
    // Verify that axios was not called
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
  
  it('should fetch from API if cache is stale or empty', async () => {
    // Setup mocks
    (getCachedFredData as jest.Mock).mockResolvedValue(null);
    (shouldFetchFromApi as jest.Mock).mockResolvedValue(true);
    mockedAxios.get.mockResolvedValue({
      data: {
        observations: [
          { date: '2023-01-01', value: '100' },
          { date: '2023-02-01', value: '101' },
          { date: '2023-03-01', value: '102' },
        ]
      }
    });
    
    // Call the function
    const result = await fetchFredData(mockSeriesId);
    
    // Verify results
    expect(result).toHaveLength(3);
    expect(result[0].date).toEqual('2023-01-01');
    expect(result[0].value).toEqual(100);
    
    // Verify that getCachedFredData was called
    expect(getCachedFredData).toHaveBeenCalledWith(mockSeriesId);
    
    // Verify that axios was called
    expect(mockedAxios.get).toHaveBeenCalled();
    
    // Verify that cacheFredData was called with the right data
    expect(cacheFredData).toHaveBeenCalledWith(mockSeriesId, expect.any(Array), expect.objectContaining({
      metricId: mockSeriesId
    }));
  });
  
  it('should handle API errors gracefully', async () => {
    // Setup mocks
    (getCachedFredData as jest.Mock).mockResolvedValue(null);
    (shouldFetchFromApi as jest.Mock).mockResolvedValue(true);
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    // Call the function and catch the error
    let error: Error | undefined;
    try {
      await fetchFredData(mockSeriesId);
    } catch (e) {
      error = e as Error;
    }
    
    // Verify that an error was thrown
    expect(error).toBeDefined();
    expect(error?.message).toContain('API Error');
    
    // Verify that cacheFredData was not called
    expect(cacheFredData).not.toHaveBeenCalled();
  });
  
  it('should not call the API if API key is not set', async () => {
    // Setup mocks
    (getCachedFredData as jest.Mock).mockResolvedValue(null);
    (shouldFetchFromApi as jest.Mock).mockResolvedValue(true);
    
    // Save original API key
    const originalApiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;
    
    try {
      // Remove API key
      delete process.env.NEXT_PUBLIC_FRED_API_KEY;
      
      // Call the function
      const result = await fetchFredData(mockSeriesId);
      
      // Verify results
      expect(result).toEqual([]);
      
      // Verify that getCachedFredData was called
      expect(getCachedFredData).toHaveBeenCalledWith(mockSeriesId);
      
      // Verify that axios was not called
      expect(mockedAxios.get).not.toHaveBeenCalled();
    } finally {
      // Restore original API key
      process.env.NEXT_PUBLIC_FRED_API_KEY = originalApiKey;
    }
  });
}); 