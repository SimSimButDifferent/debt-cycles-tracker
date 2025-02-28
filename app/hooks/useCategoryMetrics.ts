import { useState, useEffect } from 'react';
import { Metric, MetricCategory } from '../types/metrics';
import { fetchMetrics } from '../services/metricService';

export interface UseCategoryMetricsResult {
  metrics: Metric[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch metrics filtered by category
 */
export function useCategoryMetrics(category?: MetricCategory): UseCategoryMetricsResult {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allMetrics = await fetchMetrics();
        
        // Filter by category if specified
        const filteredMetrics = category 
          ? allMetrics.filter(m => m.category === category)
          : allMetrics;
        
        setMetrics(filteredMetrics);
      } catch (err) {
        console.error('Error loading metrics:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [category]);
  
  return { metrics, isLoading, error };
} 