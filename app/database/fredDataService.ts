import { prisma } from './prisma';
import { DataPoint } from '../types';
import { FRED_SERIES_MAP } from '../services/fredApi';
import { PrismaClient, Prisma } from '@prisma/client';

// Constants for data freshness
// FRED data is typically updated monthly, some series quarterly
const DATA_FRESHNESS_DAYS = 7; // Consider data fresh for a week

// Helper to check if we're running on the client side
export const isClient = typeof window !== 'undefined';

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
    console.error('Error getting cached FRED data:', error);
    return null; // Return null on error so we can fall back to API or example data
  }
}

/**
 * Check if data is stale and should be refetched
 */
function isDataStale(lastFetchDate: Date): boolean {
  const now = new Date();
  const daysSinceLastFetch = Math.floor(
    (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceLastFetch > DATA_FRESHNESS_DAYS;
}

/**
 * Cache FRED series data in the database
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
  try {
    // Skip caching if running on client side or prisma not available
    if (isClient || !prisma) {
      console.log('Running in browser or prisma unavailable, skipping database caching');
      return;
    }
    
    // Don't attempt to cache empty data
    if (!data || data.length === 0) {
      console.log(`No data to cache for series ${seriesId}`);
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Create or update the series metadata
      await tx.fredSeries.upsert({
        where: { id: seriesId },
        update: {
          metricId: metricInfo.metricId,
          name: metricInfo.name,
          description: metricInfo.description,
          unit: metricInfo.unit,
          frequency: metricInfo.frequency,
          lastUpdated: new Date()
        },
        create: {
          id: seriesId,
          metricId: metricInfo.metricId,
          name: metricInfo.name,
          description: metricInfo.description,
          unit: metricInfo.unit,
          frequency: metricInfo.frequency,
          lastUpdated: new Date()
        }
      });
      
      // Delete existing data points for this series
      await tx.cachedFredData.deleteMany({
        where: { seriesId }
      });
      
      // Insert new data points
      for (const point of data) {
        await tx.cachedFredData.create({
          data: {
            seriesId,
            date: new Date(point.date),
            value: point.value
          }
        });
      }
      
      // Update the last fetch timestamp
      await tx.lastFetchTimestamp.upsert({
        where: { seriesId },
        update: { lastFetchedAt: new Date() },
        create: { seriesId, lastFetchedAt: new Date() }
      });
    });
    
    console.log(`Successfully cached ${data.length} data points for series ${seriesId}`);
  } catch (error) {
    console.error(`Error caching FRED data for series ${seriesId}:`, error);
    // Don't throw - just log the error and continue
  }
}

/**
 * Get the FRED series ID corresponding to a metric ID
 */
export async function getFredSeriesForMetric(metricId: string): Promise<string | null> {
  try {
    // If client-side or no prisma, use the static mapping
    if (isClient || !prisma) {
      return FRED_SERIES_MAP[metricId] || null;
    }
    
    // Try to get from database first
    const seriesInfo = await prisma.fredSeries.findFirst({
      where: { metricId }
    });
    
    if (seriesInfo) {
      return seriesInfo.id;
    }
    
    // Fall back to static mapping if not in database
    return FRED_SERIES_MAP[metricId] || null;
  } catch (error) {
    console.error(`Error getting FRED series for metric ${metricId}:`, error);
    // Fall back to static mapping on error
    return FRED_SERIES_MAP[metricId] || null;
  }
}

/**
 * Determine if we should fetch new data from the FRED API
 */
export async function shouldFetchFromApi(seriesId: string): Promise<boolean> {
  try {
    // If client-side or no prisma, always fetch from API
    if (isClient || !prisma) {
      return true;
    }
    
    // Check when data was last fetched
    const lastFetch = await prisma.lastFetchTimestamp.findUnique({
      where: { seriesId }
    });
    
    // If never fetched, should fetch
    if (!lastFetch) {
      return true;
    }
    
    // If data is stale, should fetch
    if (isDataStale(lastFetch.lastFetchedAt)) {
      return true;
    }
    
    // If no data points exist, should fetch
    const dataCount = await prisma.cachedFredData.count({
      where: { seriesId }
    });
    
    if (dataCount === 0) {
      return true;
    }
    
    // Data exists and is fresh, no need to fetch
    return false;
  } catch (error) {
    console.error(`Error checking if should fetch for series ${seriesId}:`, error);
    // Default to fetching on error
    return true;
  }
} 