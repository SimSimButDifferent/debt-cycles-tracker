import { DataPoint } from '@/app/types';
import { PrismaClient } from '@prisma/client';

// Mock the prisma module before any imports that use it
jest.mock('@/app/database/prisma', () => {
  const mockLastFetchTimestamp = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };
  
  const mockFredSeries = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
  };
  
  const mockCachedFredData = {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };
  
  const mockTransaction = jest.fn();
  
  // Setup mock implementation that can reference itself
  mockTransaction.mockImplementation((callback) => {
    return Promise.resolve(callback({
      lastFetchTimestamp: mockLastFetchTimestamp,
      fredSeries: mockFredSeries,
      cachedFredData: mockCachedFredData,
      $transaction: mockTransaction,
    }));
  });
  
  return {
    prisma: {
      lastFetchTimestamp: mockLastFetchTimestamp,
      fredSeries: mockFredSeries,
      cachedFredData: mockCachedFredData,
      $transaction: mockTransaction,
    }
  };
});

// These imports must come after the mock
import { 
  getCachedFredData, 
  cacheFredData, 
  shouldFetchFromApi, 
  getFredSeriesForMetric 
} from '@/app/database/fredDataService';
import { prisma } from '@/app/database/prisma';

// Mock console methods to prevent cluttering test output
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('FRED Database Service', () => {
  const testSeriesId = 'GDPC1';
  const testMetricId = 'gdp-growth-def';
  
  const mockDataPoints: DataPoint[] = [
    { date: '2022-01-01', value: 10.5 },
    { date: '2022-02-01', value: 11.2 },
  ];

  const mockMetricInfo = {
    metricId: testMetricId,
    name: 'Test Metric',
    description: 'A test metric',
    unit: '%',
    frequency: 'Monthly'
  };

  describe('getCachedFredData', () => {
    it('should return null when no cache timestamp exists', async () => {
      // Setup: No last fetch timestamp
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue(null);
      
      // Execute
      const result = await getCachedFredData(testSeriesId);
      
      // Verify
      expect(result).toBeNull();
      expect(prisma.lastFetchTimestamp.findUnique).toHaveBeenCalledWith({
        where: { seriesId: testSeriesId }
      });
      expect(prisma.cachedFredData.findMany).not.toHaveBeenCalled();
    });

    it('should return null when cache is stale', async () => {
      // Setup: Stale timestamp (> 7 days old)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: oldDate
      });
      
      // Execute
      const result = await getCachedFredData(testSeriesId);
      
      // Verify
      expect(result).toBeNull();
      expect(prisma.cachedFredData.findMany).not.toHaveBeenCalled();
    });

    it('should return null when there are no cached data points', async () => {
      // Setup: Fresh timestamp but no data
      const freshDate = new Date();
      freshDate.setDate(freshDate.getDate() - 1); // 1 day old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: freshDate
      });
      
      prisma.cachedFredData.findMany.mockResolvedValue([]);
      
      // Execute
      const result = await getCachedFredData(testSeriesId);
      
      // Verify
      expect(result).toBeNull();
      expect(prisma.cachedFredData.findMany).toHaveBeenCalledWith({
        where: { seriesId: testSeriesId },
        orderBy: { date: 'asc' }
      });
    });

    it('should return cached data when valid', async () => {
      // Setup: Fresh data exists
      const freshDate = new Date();
      freshDate.setDate(freshDate.getDate() - 1); // 1 day old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: freshDate
      });
      
      const cachedDbData = [
        { seriesId: testSeriesId, date: new Date('2022-01-01'), value: 10.5 },
        { seriesId: testSeriesId, date: new Date('2022-02-01'), value: 11.2 }
      ];
      
      prisma.cachedFredData.findMany.mockResolvedValue(cachedDbData);
      
      // Execute
      const result = await getCachedFredData(testSeriesId);
      
      // Verify
      expect(result).toEqual([
        { date: '2022-01-01', value: 10.5 },
        { date: '2022-02-01', value: 11.2 }
      ]);
    });
    
    it('should handle database errors gracefully', async () => {
      // Setup: Database error
      prisma.lastFetchTimestamp.findUnique.mockRejectedValue(
        new Error('Database connection error')
      );
      
      // Execute
      const result = await getCachedFredData(testSeriesId);
      
      // Verify
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('cacheFredData', () => {
    const mockMetricInfo = {
      metricId: testMetricId,
      name: 'Real GDP Growth',
      description: 'Real Gross Domestic Product',
      unit: 'Billions of Chained 2012 Dollars',
      frequency: 'Quarterly'
    };

    it('should not cache empty data', async () => {
      // Setup
      const emptyData: DataPoint[] = [];
      
      // Execute
      await cacheFredData(testSeriesId, emptyData, mockMetricInfo);
      
      // Verify
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
    
    it('should cache data points and update timestamp', async () => {
      // Execute
      await cacheFredData(testSeriesId, mockDataPoints, mockMetricInfo);
      
      // Verify
      expect(prisma.$transaction).toHaveBeenCalled();
      
      // Verify series upsert
      expect(prisma.fredSeries.upsert).toHaveBeenCalledWith({
        where: { id: testSeriesId },
        update: expect.objectContaining({
          name: mockMetricInfo.name,
          description: mockMetricInfo.description,
          unit: mockMetricInfo.unit,
          frequency: mockMetricInfo.frequency
        }),
        create: expect.objectContaining({
          id: testSeriesId,
          metricId: mockMetricInfo.metricId,
          name: mockMetricInfo.name,
          description: mockMetricInfo.description,
          unit: mockMetricInfo.unit,
          frequency: mockMetricInfo.frequency
        })
      });
      
      // Verify data deletion
      expect(prisma.cachedFredData.deleteMany).toHaveBeenCalledWith({
        where: { seriesId: testSeriesId }
      });
      
      // Verify each data point was created
      expect(prisma.cachedFredData.create).toHaveBeenCalledTimes(mockDataPoints.length);
      
      // Verify timestamp update
      expect(prisma.lastFetchTimestamp.upsert).toHaveBeenCalledWith({
        where: { seriesId: testSeriesId },
        update: { lastFetchedAt: expect.any(Date) },
        create: expect.objectContaining({
          seriesId: testSeriesId,
          lastFetchedAt: expect.any(Date)
        })
      });
    });
    
    it('should handle transaction errors', async () => {
      // Setup: Transaction error
      const error = new Error('Transaction failed');
      prisma.$transaction.mockRejectedValue(error);
      
      // Execute & Verify - updated to expect the error to be thrown
      await expect(cacheFredData(testSeriesId, mockDataPoints, mockMetricInfo))
        .rejects.toThrow('Transaction failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('shouldFetchFromApi', () => {
    it('should return true when no cache timestamp exists', async () => {
      // Setup: No timestamp
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue(null);
      
      // Execute
      const result = await shouldFetchFromApi(testSeriesId);
      
      // Verify
      expect(result).toBe(true);
      expect(prisma.cachedFredData.count).not.toHaveBeenCalled();
    });
    
    it('should return true when cache is stale', async () => {
      // Setup: Stale timestamp (> 7 days old)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: oldDate
      });
      
      // Execute
      const result = await shouldFetchFromApi(testSeriesId);
      
      // Verify
      expect(result).toBe(true);
      expect(prisma.cachedFredData.count).not.toHaveBeenCalled();
    });
    
    it('should return true when timestamp fresh but no data points', async () => {
      // Setup: Fresh timestamp but no data
      const freshDate = new Date();
      freshDate.setDate(freshDate.getDate() - 1); // 1 day old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: freshDate
      });
      
      prisma.cachedFredData.count.mockResolvedValue(0);
      
      // Execute
      const result = await shouldFetchFromApi(testSeriesId);
      
      // Verify
      expect(result).toBe(true);
    });
    
    it('should return false when cache is fresh and not empty', async () => {
      // Setup: Fresh timestamp and data exists
      const freshDate = new Date();
      freshDate.setDate(freshDate.getDate() - 1); // 1 day old
      
      prisma.lastFetchTimestamp.findUnique.mockResolvedValue({
        seriesId: testSeriesId,
        lastFetchedAt: freshDate
      });
      
      prisma.cachedFredData.count.mockResolvedValue(10);
      
      // Execute
      const result = await shouldFetchFromApi(testSeriesId);
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should return true and handle errors gracefully', async () => {
      // Setup: Database error
      prisma.lastFetchTimestamp.findUnique.mockRejectedValue(
        new Error('Database error')
      );
      
      // Execute
      const result = await shouldFetchFromApi(testSeriesId);
      
      // Verify
      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getFredSeriesForMetric', () => {
    it('should return series ID from map if found', async () => {
      // This would check the internal map rather than the database
      const result = await getFredSeriesForMetric(testMetricId);
      
      // Assume testMetricId is in the internal map from the service
      expect(result).toBeTruthy();
      expect(prisma.fredSeries.findFirst).not.toHaveBeenCalled();
    });
    
    it('should query the database if not found in map', async () => {
      // Mock findFirst to return a series
      prisma.fredSeries.findFirst.mockResolvedValue({
        id: testSeriesId,
        metricId: testMetricId,
        title: 'Test Series'
      });
      
      // Use an unknown metric ID not in the internal map
      const result = await getFredSeriesForMetric('unknown-metric');
      
      // Verify
      expect(prisma.fredSeries.findFirst).toHaveBeenCalledWith({
        where: { metricId: 'unknown-metric' }
      });
    });
    
    it('should return null when metric not found anywhere', async () => {
      // Mock findFirst to return null
      prisma.fredSeries.findFirst.mockResolvedValue(null);
      
      // Execute
      const result = await getFredSeriesForMetric('non-existent-metric');
      
      // Verify
      expect(result).toBeNull();
    });
    
    it('should handle database errors gracefully', async () => {
      // Setup: Database error
      prisma.fredSeries.findFirst.mockRejectedValue(
        new Error('Database error')
      );
      
      // Execute
      const result = await getFredSeriesForMetric('error-metric');
      
      // Verify
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 