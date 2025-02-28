import { Metric } from '../types/metrics';

// Sample metrics data for initial loading
// In a real app, this would likely come from an API
const SAMPLE_METRICS: Metric[] = [
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

/**
 * Fetch all available metrics
 */
export async function fetchMetrics(): Promise<Metric[]> {
  // In a real app, this would be an API call
  // For now, just return our sample data
  return Promise.resolve(SAMPLE_METRICS);
}

/**
 * Fetch a single metric by ID
 */
export async function fetchMetricById(id: string): Promise<Metric | null> {
  const metrics = await fetchMetrics();
  return metrics.find(m => m.id === id) || null;
} 