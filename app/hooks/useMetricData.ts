'use client';

import { useState, useEffect } from 'react';
import { Metric, DataPoint } from '../types';
import { fetchFredData, processFredData, FRED_SERIES_MAP } from '../services/fredApi';
import { deflationaryMetrics, inflationaryMetrics } from '../data/metrics';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseMetricDataReturnType {
  metric: Metric | null;
  status: FetchStatus;
  error: string | null;
  isLoading: boolean;
}

// Lookup function to get the original metric by ID
function getMetricById(metricId: string): Metric | undefined {
  return [...deflationaryMetrics, ...inflationaryMetrics].find(m => m.id === metricId);
}

/**
 * Custom hook to fetch real data for a specific metric
 * Falls back to mock data if real data fetch fails
 */
export function useMetricData(metricId: string): UseMetricDataReturnType {
  const [metric, setMetric] = useState<Metric | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!metricId) return;
      
      // Set loading state
      setStatus('loading');
      setError(null);
      
      try {
        // Find the base metric with mock data
        const baseMetric = getMetricById(metricId);
        if (!baseMetric) {
          throw new Error(`Metric with ID '${metricId}' not found`);
        }
        
        // Check if we have a mapping to a FRED series
        const fredSeriesId = FRED_SERIES_MAP[metricId];
        
        if (fredSeriesId) {
          // Fetch real data from FRED API
          const rawData = await fetchFredData(fredSeriesId);
          
          // Process the data according to the metric's requirements
          const processedData = processFredData(rawData, metricId);
          
          if (processedData.length > 0) {
            // Create updated metric with real data
            setMetric({
              ...baseMetric,
              data: processedData,
              source: `Federal Reserve Economic Data (FRED) - ${fredSeriesId}`,
            });
            
            setStatus('success');
            return;
          }
        }
        
        // If we didn't get real data, use the mock data as fallback
        setMetric(baseMetric);
        setStatus('success');
        
      } catch (err) {
        console.error('Error fetching metric data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
        
        // Fallback to mock data on error
        const baseMetric = getMetricById(metricId);
        if (baseMetric) {
          setMetric(baseMetric);
        }
      }
    };

    fetchData();
  }, [metricId]);

  return {
    metric,
    status,
    error,
    isLoading: status === 'loading',
  };
}

/**
 * Custom hook to fetch real data for a category of metrics
 */
export function useCategoryMetrics(category: 'deflationary' | 'inflationary'): {
  metrics: Metric[];
  isLoading: boolean;
  error: string | null;
} {
  const [metrics, setMetrics] = useState<Metric[]>(
    category === 'deflationary' ? deflationaryMetrics : inflationaryMetrics
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const baseMetrics = category === 'deflationary' 
          ? deflationaryMetrics 
          : inflationaryMetrics;
        
        // Fetch data for metrics that have FRED series IDs
        const metricsWithRealData = await Promise.all(
          baseMetrics.map(async (metric) => {
            const fredSeriesId = FRED_SERIES_MAP[metric.id];
            
            if (fredSeriesId) {
              try {
                // Try to get real data
                const rawData = await fetchFredData(fredSeriesId);
                const processedData = processFredData(rawData, metric.id);
                
                if (processedData.length > 0) {
                  return {
                    ...metric,
                    data: processedData,
                    source: `Federal Reserve Economic Data (FRED) - ${fredSeriesId}`,
                  };
                }
              } catch (err) {
                // On error, use mock data
                console.warn(`Falling back to mock data for ${metric.id}:`, err);
              }
            }
            
            // Return original metric with mock data if we couldn't get real data
            return metric;
          })
        );
        
        if (isMounted) {
          setMetrics(metricsWithRealData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching category metrics:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setIsLoading(false);
        }
      }
    };
    
    fetchCategoryData();
    
    return () => {
      isMounted = false;
    };
  }, [category]);

  return { metrics, isLoading, error };
} 