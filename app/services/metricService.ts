import { Metric, FredDataPoint } from '../types/metrics';
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
 * Generate example data for a metric when real data can't be loaded
 */
function generateExampleData(metric: Metric): FredDataPoint[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10; // 10 years of data
  const data: FredDataPoint[] = [];
  
  // Generate different patterns based on the metric
  let minValue = 0;
  let maxValue = 100;
  let pattern: 'up' | 'down' | 'cycle' | 'random' = 'random';
  
  switch (metric.id) {
    case 'gdp':
      minValue = 17; // Trillion dollars
      maxValue = 25;
      pattern = 'up';
      break;
    case 'unemployment':
      minValue = 3; // Percentage
      maxValue = 15;
      pattern = 'cycle';
      break;
    case 'inflation':
      minValue = 0;
      maxValue = 9;
      pattern = 'cycle';
      break;
    case 'federalFunds':
      minValue = 0;
      maxValue = 5;
      pattern = 'cycle';
      break;
    case 'debtToGDP':
      minValue = 60;
      maxValue = 130;
      pattern = 'up';
      break;
    case 'yieldCurve':
      minValue = -2;
      maxValue = 3;
      pattern = 'cycle';
      break;
    case 'housingIndex':
      minValue = 100;
      maxValue = 250;
      pattern = 'up';
      break;
    case 'consumerSentiment':
      minValue = 50;
      maxValue = 110;
      pattern = 'cycle';
      break;
    default:
      minValue = 0;
      maxValue = 100;
      pattern = 'random';
  }
  
  // Generate the data points
  for (let year = startYear; year <= currentYear; year++) {
    // Generate quarterly or monthly data depending on frequency
    const intervals = metric.frequency === 'quarterly' ? 4 : 12;
    
    for (let i = 0; i < intervals; i++) {
      const progress = (year - startYear + i / intervals) / (currentYear - startYear + 1);
      let value: number;
      
      switch (pattern) {
        case 'up':
          // Upward trend with some randomness
          value = minValue + (maxValue - minValue) * progress + Math.random() * 5 - 2.5;
          break;
        case 'cycle':
          // Cyclical pattern (sine wave)
          value = ((maxValue - minValue) / 2) + ((maxValue - minValue) / 2) * 
                Math.sin(progress * Math.PI * 4) + (Math.random() * 3 - 1.5);
          break;
        case 'random':
        default:
          // Random values within range
          value = minValue + Math.random() * (maxValue - minValue);
      }
      
      // Ensure value stays within bounds and round to 2 decimal places
      value = Math.max(minValue, Math.min(maxValue, value));
      value = Math.round(value * 100) / 100;
      
      // Format the date
      let date: string;
      if (metric.frequency === 'quarterly') {
        const quarter = i + 1;
        date = `${year}-${quarter.toString().padStart(2, '0')}-01`;
      } else {
        const month = i + 1;
        date = `${year}-${month.toString().padStart(2, '0')}-01`;
      }
      
      data.push({ date, value });
    }
  }
  
  return data;
}

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
          // Generate example data as fallback
          return {
            ...metric,
            data: generateExampleData(metric),
            source: 'Example Data (No FRED mapping available)'
          };
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
          
          // If we couldn't get data, use example data
          console.log(`No data available for ${metric.id}, using example data`);
          return {
            ...metric,
            data: generateExampleData(metric),
            source: 'Example Data (FRED API data unavailable)'
          };
        } catch (error) {
          console.error(`Error fetching data for metric ${metric.id}:`, error);
          // Use example data on error
          return {
            ...metric,
            data: generateExampleData(metric),
            source: 'Example Data (Error fetching FRED data)'
          };
        }
      })
    );
    
    return metricsWithData;
  } catch (error) {
    console.error('Error in fetchMetrics:', error);
    // Generate example data for all metrics as fallback
    return METRIC_DEFINITIONS.map(metric => ({
      ...metric,
      data: generateExampleData(metric),
      source: 'Example Data (Error in fetchMetrics)'
    }));
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
      // Generate example data as fallback
      return {
        ...metricDefinition,
        data: generateExampleData(metricDefinition),
        source: 'Example Data (No FRED mapping available)'
      };
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
    
    // If we couldn't get data, use example data
    console.log(`No data available for ${id}, using example data`);
    return {
      ...metricDefinition,
      data: generateExampleData(metricDefinition),
      source: 'Example Data (FRED API data unavailable)'
    };
  } catch (error) {
    console.error(`Error fetching metric ${id}:`, error);
    // Use example data on error
    const metricDefinition = METRIC_DEFINITIONS.find(m => m.id === id);
    if (!metricDefinition) {
      return null;
    }
    
    return {
      ...metricDefinition,
      data: generateExampleData(metricDefinition),
      source: 'Example Data (Error fetching FRED data)'
    };
  }
} 