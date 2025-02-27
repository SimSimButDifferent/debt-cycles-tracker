'use client';

import { useState, useEffect } from 'react';
import { Metric, MetricCategory } from '../types';
import { deflationaryMetrics, inflationaryMetrics } from '../data/metrics';
import { fetchFredData, processFredData, FRED_SERIES_MAP } from '../services/fredApi';

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

/**
 * Custom hook to fetch real data for a specific metric
 * Falls back to mock data if real data fetch fails
 */
export function useMetricData(metricId: string): UseMetricDataReturnType {
  const [metric, setMetric] = useState<Metric | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!metricId) return;

    const fetchData = async () => {
      setStatus('loading');
      setIsLoading(true);
      setError(null);

      try {
        // First get the base metric data
        const baseMetric = getMetricById(metricId);
        
        if (!baseMetric) {
          throw new Error(`Metric with ID '${metricId}' not found`);
        }

        // Set the base metric first to ensure we have something to show
        setMetric(baseMetric);
        
        // Only try to fetch real API data if we have a FRED series mapping
        const fredSeriesId = FRED_SERIES_MAP[metricId];
        if (fredSeriesId) {
          try {
            // Fetch real data from FRED API
            const fredData = await fetchFredData(fredSeriesId);
            
            if (fredData && fredData.length > 0) {
              // Process the data based on metric type
              const processedData = processFredData(fredData, metricId);
              
              // Create updated metric with real data
              const updatedMetric: Metric = {
                ...baseMetric,
                data: processedData,
                source: `Federal Reserve Economic Data (FRED) - ${fredSeriesId}`,
              };
              
              setMetric(updatedMetric);
              setStatus('success');
            } else {
              // If no data returned but no error, just use the base metric
              console.warn(`No data returned from FRED for ${metricId}`);
              setStatus('success');
            }
          } catch (apiError) {
            // Log the API error but don't fail the hook - we still have the base data
            console.warn(`Error fetching FRED data for ${metricId}:`, apiError);
            // We already set the baseMetric earlier, so we're good
            setStatus('success');
          }
        } else {
          // No FRED mapping, just use the base metric
          setStatus('success');
        }
      } catch (err) {
        console.error('Error fetching metric data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
        
        // Try to set a fallback metric if possible
        const baseMetric = getMetricById(metricId);
        if (baseMetric) {
          setMetric(generateFallbackData(baseMetric));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [metricId]);

  return { metric, status, error, isLoading };
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
        // Get base metrics for this category
        const baseMetrics = getMetricsByCategory(category);
        
        // Immediately set the base metrics to ensure we have something to show
        setMetrics(baseMetrics);
        
        // Try to enhance with real data from FRED API where possible
        const enhancedMetrics = await Promise.all(
          baseMetrics.map(async (metric) => {
            // Check if this metric has a FRED series mapping
            const fredSeriesId = FRED_SERIES_MAP[metric.id];
            if (!fredSeriesId) return metric;
            
            try {
              // Fetch real data from FRED API - if this fails, just return the original metric
              const fredData = await fetchFredData(fredSeriesId).catch(() => []);
              
              if (fredData && fredData.length > 0) {
                // Process the data based on metric type
                const processedData = processFredData(fredData, metric.id);
                
                // Return enhanced metric with real data
                return {
                  ...metric,
                  data: processedData,
                  source: `Federal Reserve Economic Data (FRED) - ${fredSeriesId}`,
                };
              }
              
              // If no data, just return the original metric
              return metric;
            } catch (apiError) {
              // If API call fails, just return the original metric
              console.warn(`Error enhancing metric ${metric.id} with FRED data:`, apiError);
              return metric;
            }
          })
        );
        
        // Update with any successfully enhanced metrics
        setMetrics(enhancedMetrics);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching category metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        
        // Ensure we still have the base metrics even if there was an error
        const baseMetrics = getMetricsByCategory(category);
        setMetrics(baseMetrics);
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  return { metrics, isLoading, error };
} 