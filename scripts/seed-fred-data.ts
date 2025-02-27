/**
 * This script fetches initial data from the FRED API for all
 * configured series and stores it in the database.
 * 
 * Run with: npx ts-node -O '{"module":"CommonJS"}' scripts/seed-fred-data.ts
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { FRED_SERIES_MAP, FRED_SERIES_INFO } from '../app/services/fredApi';
import { cacheFredData } from '../app/database/fredDataService';

const prisma = new PrismaClient();

// Get API key from .env
require('dotenv').config();
const API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

type DataPoint = {
  date: string;
  value: number;
};

/**
 * Fetches data for a FRED series directly from the API
 */
async function fetchFredDataDirect(
  seriesId: string,
  startDate: string = '1900-01-01',
  endDate: string = new Date().toISOString().split('T')[0]
): Promise<DataPoint[]> {
  if (!API_KEY) {
    console.error('FRED API key not found in environment variables');
    return [];
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: API_KEY,
    file_type: 'json',
    observation_start: startDate,
    observation_end: endDate,
  });

  const url = `${FRED_API_BASE_URL}?${params.toString()}`;

  try {
    console.log(`Fetching data for ${seriesId}...`);
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.observations) {
      return response.data.observations
        .map((obs: { date: string, value: string }) => ({
          date: obs.date,
          value: parseFloat(obs.value) || 0
        }))
        .filter((point: DataPoint) => !isNaN(point.value));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching data for ${seriesId}:`, error);
    return [];
  }
}

/**
 * Main function to seed the database with FRED data
 */
async function seedFredData() {
  console.log('Starting database seed for FRED data...');

  // Get all series IDs we want to cache
  const seriesIds = Object.values(FRED_SERIES_MAP);

  for (const seriesId of seriesIds) {
    try {
      console.log(`Processing series ${seriesId}...`);
      
      // Find the metricId for this seriesId
      const metricId = Object.entries(FRED_SERIES_MAP)
        .find(([_, series]) => series === seriesId)?.[0];
      
      if (!metricId) {
        console.warn(`No metric ID found for series ${seriesId}, skipping`);
        continue;
      }
      
      // Get the series info
      const seriesInfo = FRED_SERIES_INFO[seriesId];
      if (!seriesInfo) {
        console.warn(`No series info found for ${seriesId}, using defaults`);
      }
      
      // Fetch data directly from FRED API
      const data = await fetchFredDataDirect(seriesId);
      
      if (data.length === 0) {
        console.warn(`No data found for series ${seriesId}, skipping`);
        continue;
      }
      
      console.log(`Fetched ${data.length} data points for ${seriesId}`);
      
      // Cache the data in the database
      await cacheFredData(seriesId, data, {
        metricId,
        name: seriesInfo?.name || `FRED Series ${seriesId}`,
        description: seriesInfo?.description || 'Economic data from FRED',
        unit: seriesInfo?.unit || '',
        frequency: seriesInfo?.frequency || 'Unknown'
      });
      
      console.log(`Successfully cached data for ${seriesId}`);
    } catch (error) {
      console.error(`Error processing series ${seriesId}:`, error);
    }
  }

  console.log('Database seed completed!');
}

// Execute the seed function
seedFredData()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma connection
    await prisma.$disconnect();
  }); 