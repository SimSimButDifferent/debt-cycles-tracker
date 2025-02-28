'use client';

import { useState, useEffect } from 'react';
import { Metric, MetricCategory } from '../types/metrics';
import { deflationaryMetrics, inflationaryMetrics } from '../data/metrics';
import { 
  fetchFredData, 
  calculateAnnualPercentageChange,
  FRED_SERIES_MAP 
} from '../services/fredApiClient';
import { FredDataPoint, MetricTimeframe } from '../types/metrics';
import { fetchMetrics } from '../services/metricService';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseMetricDataReturnType {
  metric: Metric | null;
  status: FetchStatus;
  error: string | null;
  isLoading: boolean;
}

/**
 * Helper function to get a metric by ID from our data
 */
function getMetricById(metricId: string): Metric | undefined {
  return [...deflationaryMetrics, ...inflationaryMetrics].find(m => m.id === metricId);
}

/**
 * Helper function to get metrics by category
 */
export function getMetricsByCategory(category: MetricCategory): Metric[] {
  switch(category) {
    case 'deflationary':
      return deflationaryMetrics;
    case 'inflationary':
      return inflationaryMetrics;
    case 'both':
      return [...deflationaryMetrics, ...inflationaryMetrics];
    default:
      return [];
  }
}

// Add a function to generate fallback data in case of API failures
function generateFallbackData(metric: Metric): Metric {
  // Clone the original metric to avoid modifying it
  return { ...metric };
}

export interface UseMetricDataResult {
  data: FredDataPoint[];
  isLoading: boolean;
  error: string | null;
  percentChange: FredDataPoint[];
}

/**
 * Hook to fetch and manage FRED data for a specific metric series
 */
export function useMetricData(seriesId: string, timeframe: MetricTimeframe = 'all'): UseMetricDataResult {
  const [data, setData] = useState<FredDataPoint[]>([]);
  const [percentChange, setPercentChange] = useState<FredDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no seriesId is provided
    if (!seriesId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchFredData(seriesId);
        
        // Filter based on timeframe
        let filteredData = filterDataByTimeframe(result, timeframe);
        
        // Calculate percentage change
        const changeData = calculateAnnualPercentageChange(result);
        let filteredChangeData = filterDataByTimeframe(changeData, timeframe);
        
        if (isMounted) {
          setData(filteredData);
          setPercentChange(filteredChangeData);
          setError(null);
        }
      } catch (err) {
        console.error(`Error fetching data for ${seriesId}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setData([]);
          setPercentChange([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [seriesId, timeframe]);

  return { data, isLoading, error, percentChange };
}

/**
 * Filter data based on the selected timeframe
 */
function filterDataByTimeframe(data: FredDataPoint[], timeframe: MetricTimeframe): FredDataPoint[] {
  if (!data.length || timeframe === 'all') {
    return data;
  }

  const now = new Date();
  let cutoffDate = new Date();

  switch (timeframe) {
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case '5y':
      cutoffDate.setFullYear(now.getFullYear() - 5);
      break;
    case '10y':
      cutoffDate.setFullYear(now.getFullYear() - 10);
      break;
    case '20y':
      cutoffDate.setFullYear(now.getFullYear() - 20);
      break;
    default:
      return data;
  }

  return data.filter(point => {
    const pointDate = new Date(point.date);
    return pointDate >= cutoffDate;
  });
}

/**
 * Custom hook to fetch real data for a category of metrics
 */
export function useCategoryMetrics(category: 'deflationary' | 'inflationary' | 'both'): {
  metrics: Metric[];
  isLoading: boolean;
  error: string | null;
} {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all metrics from our updated metricService
        const allMetrics = await fetchMetrics();
        
        // Filter metrics by category
        const filteredMetrics = allMetrics.filter(metric => {
          if (category === 'both') {
            return true; // Return all metrics
          }
          // Convert the category to string for comparison
          return metric.category === category.toString();
        });
        
        setMetrics(filteredMetrics);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching category metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  return { metrics, isLoading, error };
} 