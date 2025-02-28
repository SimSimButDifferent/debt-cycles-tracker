/**
 * Types for FRED data integration
 */

/**
 * Represents a data point from the FRED API
 */
export interface FredDataPoint {
  date: string;
  value: number;
}

/**
 * Timeframe options for filtering metric data
 */
export type MetricTimeframe = 'all' | '1y' | '5y' | '10y' | '20y';

/**
 * Metric categories for grouping
 */
export type MetricCategory = 'economic' | 'financial' | 'monetary' | 'debt' | 'consumer';

/**
 * Status of a metric's trend relative to debt cycle
 */
export type TrendStatus = 'neutral' | 'positive' | 'negative' | 'warning';

/**
 * Core metric data structure
 */
export interface Metric {
  id: string;
  title: string;
  description: string;
  unit: string;
  category: MetricCategory;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  data: FredDataPoint[];
  source: string;
  trendStatus?: TrendStatus;
  trendDescription?: string;
  isPercentage?: boolean;
} 