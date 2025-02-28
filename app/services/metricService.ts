import { Metric } from '../types/metrics';
import { fetchFredData, FRED_SERIES_MAP, FRED_SERIES_INFO } from './fredApi';
import { getCachedFredData } from '../database/fredDataService';

// Sample metrics definitions - we'll keep these for structure, but populate data dynamically
const METRIC_DEFINITIONS: Metric[] = [
  {
    id: 'gdp',
    title: 'Real GDP',
    description: 'Gross Domestic Product adjusted for inflation, measuring the total value of goods and services produced.',
    unit: ' Trillion $',
    category: 'economic',
    frequency: 'quarterly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    trendStatus: 'positive',
    trendDescription: 'GDP growth is fundamental to understanding the debt cycle. During the expansion phase, GDP grows steadily, while during contractions, growth slows or becomes negative.'
  },
  {
    id: 'unemployment',
    title: 'Unemployment Rate',
    description: 'Percentage of the labor force that is jobless and actively seeking employment.',
    unit: '%',
    category: 'economic',
    frequency: 'monthly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    isPercentage: true,
    trendStatus: 'positive',
    trendDescription: 'Unemployment typically falls during economic expansions and rises during contractions. Rapid increases often signal the deflationary phase of a debt cycle.'
  },
  {
    id: 'inflation',
    title: 'Consumer Price Index',
    description: 'Measures changes in the price level of a weighted average market basket of consumer goods and services.',
    unit: '',
    category: 'monetary',
    frequency: 'monthly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    trendStatus: 'warning',
    trendDescription: 'Inflation is a key indicator in debt cycles. High inflation can signal the inflationary phase, while deflation often accompanies deflationary debt crises.'
  },
  {
    id: 'federalFunds',
    title: 'Federal Funds Rate',
    description: 'The interest rate at which banks lend reserve balances to other banks overnight.',
    unit: '%',
    category: 'monetary',
    frequency: 'daily',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    isPercentage: true,
    trendStatus: 'neutral',
    trendDescription: 'The Federal Funds Rate is the primary tool central banks use to respond to debt cycles. Rates are lowered during deflationary phases and raised during inflationary ones.'
  },
  {
    id: 'debtToGDP',
    title: 'Federal Debt to GDP',
    description: 'Total federal government debt as a percentage of Gross Domestic Product.',
    unit: '%',
    category: 'debt',
    frequency: 'quarterly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    isPercentage: true,
    trendStatus: 'negative',
    trendDescription: 'The debt-to-GDP ratio is central to debt cycle theory. High and rising ratios can indicate vulnerability to debt crises.'
  },
  {
    id: 'yieldCurve',
    title: 'Treasury Yield Curve',
    description: 'The difference between 10-year and 2-year Treasury bond yields.',
    unit: '%',
    category: 'financial',
    frequency: 'daily',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    isPercentage: true,
    trendStatus: 'warning',
    trendDescription: 'An inverted yield curve (negative values) has historically been a reliable predictor of economic recessions and deflationary phases of debt cycles.'
  },
  {
    id: 'housingIndex',
    title: 'Housing Price Index',
    description: 'Measures changes in single-family home prices across the United States.',
    unit: '',
    category: 'financial',
    frequency: 'monthly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    trendStatus: 'neutral',
    trendDescription: 'Housing prices often rise during the expansion phase of a debt cycle and fall during the deleveraging phase, especially in deflationary debt crises.'
  },
  {
    id: 'consumerSentiment',
    title: 'Consumer Sentiment',
    description: 'Index measuring consumer confidence regarding the economy and personal finances.',
    unit: '',
    category: 'consumer',
    frequency: 'monthly',
    data: [], // Will be populated from FRED API
    source: 'Federal Reserve Economic Data (FRED)',
    trendStatus: 'neutral',
    trendDescription: 'Consumer sentiment typically rises during economic expansions and falls during contractions, reflecting psychological aspects of debt cycles.'
  }
];

// Map our internal metric IDs to FRED series IDs
const METRIC_TO_FRED_MAP: Record<string, string> = {
  'gdp': 'A191RL1Q225SBEA', // Real GDP Growth Rate
  'unemployment': 'UNRATE', // Unemployment Rate
  'inflation': 'CPIAUCSL', // Consumer Price Index
  'federalFunds': 'DFF', // Federal Funds Rate
  'debtToGDP': 'GFDEGDQ188S', // Federal Debt to GDP
  'yieldCurve': 'T10Y2Y', // Treasury Yield Curve
  'housingIndex': 'CSUSHPINSA', // Housing Price Index
  'consumerSentiment': 'UMCSENT', // Consumer Sentiment
};

/**
 * Fetch all available metrics with real data
 */
export async function fetchMetrics(): Promise<Metric[]> {
  try {
    // Start with our metric definitions
    const metrics = [...METRIC_DEFINITIONS];
    
    // Fetch real data for each metric
    const metricsWithData = await Promise.all(
      metrics.map(async (metric) => {
        // Get the FRED series ID for this metric
        const seriesId = METRIC_TO_FRED_MAP[metric.id];
        if (!seriesId) {
          console.warn(`No FRED series mapping for metric ${metric.id}`);
          return metric;
        }
        
        try {
          // First check if we have data in the database
          const cachedData = await getCachedFredData(seriesId);
          
          if (cachedData && cachedData.length > 0) {
            // If we have cached data, use it
            return {
              ...metric,
              data: cachedData,
              source: `Federal Reserve Economic Data (FRED) - ${seriesId}`
            };
          }
          
          // If no cached data, fetch from the API
          const apiData = await fetchFredData(seriesId);
          
          if (apiData && apiData.length > 0) {
            return {
              ...metric,
              data: apiData,
              source: `Federal Reserve Economic Data (FRED) - ${seriesId}`
            };
          }
          
          // If we couldn't get data, return the metric with empty data
          return metric;
        } catch (error) {
          console.error(`Error fetching data for metric ${metric.id}:`, error);
          return metric;
        }
      })
    );
    
    return metricsWithData;
  } catch (error) {
    console.error('Error in fetchMetrics:', error);
    // Return the base metrics without real data as a fallback
    return METRIC_DEFINITIONS;
  }
}

/**
 * Fetch a single metric by ID
 */
export async function fetchMetricById(id: string): Promise<Metric | null> {
  try {
    const metricDefinition = METRIC_DEFINITIONS.find(m => m.id === id);
    if (!metricDefinition) {
      return null;
    }
    
    // Get the FRED series ID for this metric
    const seriesId = METRIC_TO_FRED_MAP[id];
    if (!seriesId) {
      console.warn(`No FRED series mapping for metric ${id}`);
      return metricDefinition;
    }
    
    // First check if we have data in the database
    const cachedData = await getCachedFredData(seriesId);
    
    if (cachedData && cachedData.length > 0) {
      // If we have cached data, use it
      return {
        ...metricDefinition,
        data: cachedData,
        source: `Federal Reserve Economic Data (FRED) - ${seriesId}`
      };
    }
    
    // If no cached data, fetch from the API
    const apiData = await fetchFredData(seriesId);
    
    if (apiData && apiData.length > 0) {
      return {
        ...metricDefinition,
        data: apiData,
        source: `Federal Reserve Economic Data (FRED) - ${seriesId}`
      };
    }
    
    // If we couldn't get data, return the base metric
    return metricDefinition;
  } catch (error) {
    console.error(`Error fetching metric ${id}:`, error);
    // Return the base metric as a fallback
    return METRIC_DEFINITIONS.find(m => m.id === id) || null;
  }
} 