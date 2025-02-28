import { useState, useEffect } from 'react';
import { Metric } from '../types/metrics';
import { fetchMetrics } from '../services/metricService';

export interface UseCategoryMetricsResult {
  metrics: Metric[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch metrics filtered by category
 */
export function useCategoryMetrics(category: 'deflationary' | 'inflationary' | 'both'): UseCategoryMetricsResult {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allMetrics = await fetchMetrics();
        
        // Filter by category
        let filteredMetrics = allMetrics;
        if (category !== 'both') {
          filteredMetrics = allMetrics.filter(m => m.category === category);
        }
        
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