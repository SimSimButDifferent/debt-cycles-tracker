'use client';

import axios from 'axios';
import { DataPoint } from '../types';

// FRED API base URL
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
// Use environment variable for the API key
const API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;

// Map of our metric IDs to FRED series IDs
export const FRED_SERIES_MAP: Record<string, string> = {
  'debt-to-gdp': 'GFDEGDQ188S', // Federal Debt to GDP
  'short-term-interest': 'DFF', // Federal Funds Rate
  'long-term-interest': 'GS10', // 10-Year Treasury Constant Maturity Rate
  'unemployment': 'UNRATE', // Unemployment Rate
  'stock-market': 'SP500', // S&P 500
  'inflation-def': 'CPIAUCSL', // Consumer Price Index for All Urban Consumers
  'gdp-growth-def': 'A191RL1Q225SBEA', // Real GDP Growth Rate
};

/**
 * Fetches time series data from FRED API
 * @param seriesId The FRED series ID
 * @param startDate The start date in YYYY-MM-DD format
 * @param endDate The end date in YYYY-MM-DD format
 * @returns Array of DataPoints with date and value
 */
export async function fetchFredData(
  seriesId: string,
  startDate: string = '1900-01-01',
  endDate: string = new Date().toISOString().split('T')[0]
): Promise<DataPoint[]> {
  try {
    const response = await axios.get(FRED_API_BASE_URL, {
      params: {
        series_id: seriesId,
        api_key: API_KEY,
        file_type: 'json',
        observation_start: startDate,
        observation_end: endDate,
      },
    });

    if (response.data && response.data.observations) {
      return response.data.observations.map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value) || 0 // Handle potential non-numeric values
      })).filter((point: DataPoint) => !isNaN(point.value));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching FRED data for series ${seriesId}:`, error);
    throw new Error(`Failed to fetch data from FRED: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculates the annual percentage change for a time series
 * @param data Array of DataPoints sorted by date
 * @returns Array of DataPoints with the annual percentage change
 */
export function calculateAnnualPercentageChange(data: DataPoint[]): DataPoint[] {
  if (data.length < 2) return [];
  
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const result: DataPoint[] = [];
  
  for (let i = 12; i < sortedData.length; i++) {
    const currentValue = sortedData[i].value;
    const previousValue = sortedData[i - 12].value;
    
    if (previousValue !== 0) {
      const percentChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
      
      result.push({
        date: sortedData[i].date,
        value: Number(percentChange.toFixed(2))
      });
    }
  }
  
  return result;
}

/**
 * Processes raw FRED data based on metric requirements
 * @param data The raw data from FRED
 * @param metricId Our internal metric ID
 * @returns Processed data appropriate for the metric
 */
export function processFredData(data: DataPoint[], metricId: string): DataPoint[] {
  switch (metricId) {
    case 'inflation-def':
    case 'gdp-growth-def':
      // These metrics need to be represented as percentage changes
      return calculateAnnualPercentageChange(data);
    
    case 'stock-market':
      // For stock market indices, we might want to normalize or adjust the data
      // but for now we'll just return the raw data
      return data;
      
    default:
      // For most metrics, we can use the raw data
      return data;
  }
} 