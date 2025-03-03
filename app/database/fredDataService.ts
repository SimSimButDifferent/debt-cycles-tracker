import { prisma } from './prisma';
import { DataPoint } from '../types';
import { FRED_SERIES_MAP } from '../services/fredApi';
import { PrismaClient, Prisma } from '@prisma/client';

// Constants for data freshness
// FRED data is typically updated monthly, some series quarterly
const DATA_FRESHNESS_DAYS = 7; // Consider data fresh for a week

// Helper to check if we're running on the client side
const isClient = typeof window !== 'undefined';

/**
 * Get cached data for a FRED series if available and fresh
 * @param seriesId FRED series ID
 * @returns Cached data points or null if not available or stale
 */
export async function getCachedFredData(seriesId: string): Promise<DataPoint[] | null> {
  try {
    // If we're on the client side or prisma is not available, return null
    if (isClient || !prisma) {
      console.log('Running in browser or prisma unavailable, skipping database check');
      return null;
    }
    
    // Check when data was last fetched
    const lastFetch = await prisma.lastFetchTimestamp.findUnique({
      where: { seriesId }
    });
    
    // If data was never fetched or is stale, return null
    // This will trigger a fresh fetch from the API
    if (!lastFetch || isDataStale(lastFetch.lastFetchedAt)) {
      return null;
    }
    
    // Get the cached data points
    const cachedData = await prisma.cachedFredData.findMany({
      where: { seriesId },
      orderBy: { date: 'asc' }
    });
    
    // If no data points found, return null
    if (!cachedData.length) {
      return null;
    }
    
    // Transform to our DataPoint format
    return cachedData.map((point) => ({
      date: point.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      value: point.value
    }));
  } catch (error) {
    console.error(`Error retrieving cached data for ${seriesId}:`, error);
    return null;
  }
}

/**
 * Check if the cached data is stale based on last fetch time
 * @param lastFetchDate Date when data was last fetched
 * @returns true if data is stale and needs refresh
 */
function isDataStale(lastFetchDate: Date): boolean {
  const now = new Date();
  const diffDays = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > DATA_FRESHNESS_DAYS;
}

/**
 * Save FRED data to the database cache
 * @param seriesId FRED series ID
 * @param data Array of DataPoints to cache
 */
export async function cacheFredData(
  seriesId: string, 
  data: DataPoint[],
  metricInfo: { 
    metricId: string,
    name: string,
    description: string,
    unit: string,
    frequency: string
  }
): Promise<void> {
  if (!data.length) return;
  
  try {
    // If we're on the client side or prisma is not available, just log and return
    if (isClient || !prisma) {
      console.log('Running in browser or prisma unavailable, skipping database cache');
      return;
    }
    
    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Upsert the FRED series info
      await tx.fredSeries.upsert({
        where: { id: seriesId },
        update: {
          name: metricInfo.name,
          description: metricInfo.description,
          unit: metricInfo.unit,
          frequency: metricInfo.frequency
        },
        create: {
          id: seriesId,
          metricId: metricInfo.metricId,
          name: metricInfo.name,
          description: metricInfo.description,
          unit: metricInfo.unit,
          frequency: metricInfo.frequency
        }
      });
      
      // Clear existing data points to avoid duplicates
      await tx.cachedFredData.deleteMany({
        where: { seriesId }
      });
      
      // Insert all data points
      for (const point of data) {
        // Parse the date string to a Date object
        const date = new Date(point.date);
        
        await tx.cachedFredData.create({
          data: {
            seriesId,
            date,
            value: point.value
          }
        });
      }
      
      // Update the last fetch timestamp
      await tx.lastFetchTimestamp.upsert({
        where: { seriesId },
        update: { lastFetchedAt: new Date() },
        create: { 
          seriesId,
          lastFetchedAt: new Date()
        }
      });
    });
    
    console.log(`Successfully cached ${data.length} data points for ${seriesId}`);
  } catch (error) {
    console.error(`Error caching data for ${seriesId}:`, error);
    throw error;
  }
}

/**
 * Get FRED series information for a metric
 * @param metricId Our internal metric ID
 * @returns FRED series ID or null if not found
 */
export async function getFredSeriesForMetric(metricId: string): Promise<string | null> {
  try {
    // First check the map from our hardcoded mapping
    const seriesId = FRED_SERIES_MAP[metricId];
    if (seriesId) return seriesId;
    
    // If we're on the client side or prisma is not available, return null
    if (isClient || !prisma) {
      return null;
    }
    
    // If not found in the map, check the database
    const series = await prisma.fredSeries.findFirst({
      where: { metricId }
    });
    
    return series?.id || null;
  } catch (error) {
    console.error(`Error getting FRED series for metric ${metricId}:`, error);
    return null;
  }
}

/**
 * Check if we should fetch fresh data from the API
 * @param seriesId FRED series ID
 * @returns true if data should be fetched from API
 */
export async function shouldFetchFromApi(seriesId: string): Promise<boolean> {
  try {
    // If we're on the client side or prisma is not available, always fetch from API
    if (isClient || !prisma) {
      return true;
    }
    
    const lastFetch = await prisma.lastFetchTimestamp.findUnique({
      where: { seriesId }
    });
    
    // If never fetched or data is stale, fetch from API
    if (!lastFetch || isDataStale(lastFetch.lastFetchedAt)) {
      return true;
    }
    
    // If we have fresh data, check if we have any data points
    const dataCount = await prisma.cachedFredData.count({
      where: { seriesId }
    });
    
    // If no data points, fetch from API
    return dataCount === 0;
  } catch (error) {
    console.error(`Error checking if should fetch from API for ${seriesId}:`, error);
    // Default to fetching from API if any error occurs
    return true;
  }
} 