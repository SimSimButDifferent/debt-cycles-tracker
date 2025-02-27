import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { deflationaryMetrics, inflationaryMetrics } from '../app/data/metrics';
import { fetchFredData, FRED_SERIES_INFO, FRED_SERIES_MAP } from '../app/services/fredApi';

const prisma = new PrismaClient();

/**
 * Seeds a single metric by fetching data from FRED API and storing in database
 * @param prismaClient PrismaClient instance to use for database operations
 * @param metricId The metric ID to seed
 * @param metricTitle Optional title for the metric (used for logging)
 * @returns Promise that resolves when seeding is complete
 */
export async function seedMetric(
  prismaClient: PrismaClient, 
  metricId: string, 
  metricTitle?: string
) {
  console.log(`Seeding metric ${metricId}${metricTitle ? ` (${metricTitle})` : ''}...`);
  
  try {
    // Get the FRED series ID from our mapping
    const seriesId = FRED_SERIES_MAP[metricId];
    if (!seriesId) {
      console.warn(`No FRED series ID found for metric ${metricId}`);
      return null;
    }
    
    // Check if we already have this series in the database
    const existing = await prismaClient.fredSeries.findUnique({
      where: { id: seriesId }
    });
    
    if (existing) {
      console.log(`FRED series ${seriesId} already exists in database. Checking data points...`);
      
      // Check if we have data points
      const dataCount = await prismaClient.cachedFredData.count({
        where: { seriesId }
      });
      
      if (dataCount > 0) {
        console.log(`Series ${seriesId} already has ${dataCount} data points. Skipping.`);
        return { seriesId, dataCount };
      }
      
      console.log(`Series ${seriesId} exists but has no data points. Fetching data...`);
    }
    
    // Fetch data from FRED API
    const data = await fetchFredData(seriesId);
    
    if (!data || data.length === 0) {
      console.warn(`No data returned for series ${seriesId}`);
      return null;
    }
    
    // Get metadata for this series
    const seriesInfo = FRED_SERIES_INFO[seriesId] || {
      name: `FRED Series ${seriesId}`,
      description: 'Economic data from FRED',
      unit: '',
      frequency: 'Unknown'
    };
    
    // Save to database using a transaction
    await prismaClient.$transaction(async (tx: Prisma.TransactionClient) => {
      // Upsert the series info
      await tx.fredSeries.upsert({
        where: { id: seriesId },
        update: {
          name: seriesInfo.name,
          description: seriesInfo.description,
          unit: seriesInfo.unit,
          frequency: seriesInfo.frequency
        },
        create: {
          id: seriesId,
          metricId: metricId,
          name: seriesInfo.name,
          description: seriesInfo.description,
          unit: seriesInfo.unit,
          frequency: seriesInfo.frequency
        }
      });
      
      // Delete any existing data points to avoid duplicates
      await tx.cachedFredData.deleteMany({
        where: { seriesId }
      });
      
      // Insert all data points
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
        create: { 
          seriesId,
          lastFetchedAt: new Date()
        }
      });
    });
    
    console.log(`✅ Successfully seeded ${seriesId} with ${data.length} observations`);
    return { seriesId, dataCount: data.length };
  } catch (error) {
    console.error(`Error seeding metric ${metricId}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting database seed...');
  
  // Get all metrics
  const allMetrics = [...deflationaryMetrics, ...inflationaryMetrics];
  const uniqueMetricIds = [...new Set(allMetrics.map(m => m.id))];
  
  // Seed each metric
  for (const metricId of uniqueMetricIds) {
    await seedMetric(prisma, metricId);
  }
  
  console.log('Seed completed!');
}

// Only run the main function if this script is executed directly
if (require.main === module) {
  main()
    .catch(e => {
      console.error('Error in seed script:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 