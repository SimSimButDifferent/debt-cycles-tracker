import { DataPoint, Metric } from '../types';

// Helper function to generate random historical data
const generateHistoricalData = (
  startYear: number = 1900,
  endYear: number = 2023,
  minValue: number = 0,
  maxValue: number = 100,
  trend: 'up' | 'down' | 'cycle' | 'random' = 'random'
): DataPoint[] => {
  const data: DataPoint[] = [];
  const years = endYear - startYear + 1;
  
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    let value: number;
    
    switch (trend) {
      case 'up':
        // Upward trend with some randomness
        value = minValue + ((maxValue - minValue) * i / years) + (Math.random() * 10 - 5);
        break;
      case 'down':
        // Downward trend with some randomness
        value = maxValue - ((maxValue - minValue) * i / years) + (Math.random() * 10 - 5);
        break;
      case 'cycle':
        // Cyclical pattern (sine wave)
        value = ((maxValue - minValue) / 2) + ((maxValue - minValue) / 2) * 
                Math.sin(i / (years / 8) * Math.PI * 2) + (Math.random() * 8 - 4);
        break;
      case 'random':
      default:
        // Random values within range
        value = minValue + Math.random() * (maxValue - minValue);
    }
    
    // Ensure value stays within bounds
    value = Math.max(minValue, Math.min(maxValue, value));
    
    data.push({
      date: year.toString(),
      value: Number(value.toFixed(2))
    });
  }
  
  return data;
};

// Deflationary Debt Cycle Metrics
export const deflationaryMetrics: Metric[] = [
  {
    id: 'debt-to-gdp',
    name: 'Debt-to-GDP Ratio',
    description: 'The ratio of a country\'s total debt to its gross domestic product (GDP), indicating the country\'s ability to pay back its debt.',
    category: 'deflationary',
    unit: '%',
    source: 'Federal Reserve Economic Data (FRED)',
    data: generateHistoricalData(1900, 2023, 30, 140, 'cycle')
  },
  {
    id: 'short-term-interest',
    name: 'Short-Term Interest Rates',
    description: 'Interest rates on short-term debt instruments, typically influenced by central bank policy.',
    category: 'deflationary',
    unit: '%',
    source: 'Federal Reserve Economic Data (FRED)',
    data: generateHistoricalData(1900, 2023, 0, 20, 'cycle')
  },
  {
    id: 'long-term-interest',
    name: 'Long-Term Interest Rates',
    description: 'Interest rates on long-term debt instruments, such as 10-year government bonds.',
    category: 'deflationary',
    unit: '%',
    source: 'Federal Reserve Economic Data (FRED)',
    data: generateHistoricalData(1900, 2023, 1, 15, 'cycle')
  },
  {
    id: 'unemployment',
    name: 'Unemployment Rate',
    description: 'The percentage of the labor force that is unemployed but actively seeking employment.',
    category: 'deflationary',
    unit: '%',
    source: 'Bureau of Labor Statistics',
    data: generateHistoricalData(1900, 2023, 2, 25, 'cycle')
  },
  {
    id: 'stock-market',
    name: 'Stock Market Indices',
    description: 'Measures of the value of a section of the stock market, typically represented by the S&P 500 for the U.S.',
    category: 'deflationary',
    unit: 'index',
    source: 'S&P Dow Jones Indices',
    data: generateHistoricalData(1900, 2023, 10, 5000, 'up')
  },
  {
    id: 'real-estate',
    name: 'Real Estate Prices',
    description: 'Average prices of residential properties, adjusted for inflation.',
    category: 'deflationary',
    unit: 'index',
    source: 'Case-Shiller Home Price Index',
    data: generateHistoricalData(1900, 2023, 50, 250, 'up')
  },
  {
    id: 'credit-growth',
    name: 'Credit Growth Rates',
    description: 'Annual percentage change in total credit to the non-financial sector.',
    category: 'deflationary',
    unit: '%',
    source: 'Bank for International Settlements',
    data: generateHistoricalData(1900, 2023, -10, 20, 'cycle')
  },
  {
    id: 'inflation-def',
    name: 'Inflation Rates',
    description: 'Annual percentage change in price levels, typically measured by the Consumer Price Index (CPI).',
    category: 'both',
    unit: '%',
    source: 'Bureau of Labor Statistics',
    data: generateHistoricalData(1900, 2023, -5, 25, 'cycle')
  },
  {
    id: 'gdp-growth-def',
    name: 'GDP Growth Rates',
    description: 'Annual percentage change in real Gross Domestic Product.',
    category: 'both',
    unit: '%',
    source: 'Bureau of Economic Analysis',
    data: generateHistoricalData(1900, 2023, -15, 20, 'cycle')
  },
  {
    id: 'debt-service-def',
    name: 'Debt Service Payments',
    description: 'Debt service payments as a percentage of GDP, representing the burden of debt on the economy.',
    category: 'both',
    unit: '%',
    source: 'Bank for International Settlements',
    data: generateHistoricalData(1900, 2023, 5, 35, 'cycle')
  }
];

// Inflationary Debt Cycle Metrics
export const inflationaryMetrics: Metric[] = [
  {
    id: 'inflation-inf',
    name: 'Inflation Rates',
    description: 'Annual percentage change in price levels, typically measured by the Consumer Price Index (CPI).',
    category: 'both',
    unit: '%',
    source: 'Bureau of Labor Statistics',
    data: generateHistoricalData(1900, 2023, -5, 25, 'cycle')
  },
  {
    id: 'real-exchange',
    name: 'Real Exchange Rates',
    description: 'Exchange rates adjusted for inflation differentials between countries.',
    category: 'inflationary',
    unit: 'index',
    source: 'Bank for International Settlements',
    data: generateHistoricalData(1900, 2023, 60, 140, 'cycle')
  },
  {
    id: 'nominal-exchange',
    name: 'Nominal Exchange Rates',
    description: 'The current exchange rate between currencies, unadjusted for inflation.',
    category: 'inflationary',
    unit: 'index',
    source: 'Federal Reserve',
    data: generateHistoricalData(1900, 2023, 50, 150, 'cycle')
  },
  {
    id: 'foreign-debt',
    name: 'Foreign Debt Percentage',
    description: 'Foreign debt as a percentage of GDP, indicating external financial obligations.',
    category: 'inflationary',
    unit: '%',
    source: 'International Monetary Fund',
    data: generateHistoricalData(1900, 2023, 5, 60, 'cycle')
  },
  {
    id: 'current-account',
    name: 'Current Account Balance',
    description: 'The balance of trade plus net income plus net current transfers as a percentage of GDP.',
    category: 'inflationary',
    unit: '%',
    source: 'Bureau of Economic Analysis',
    data: generateHistoricalData(1900, 2023, -8, 8, 'cycle')
  },
  {
    id: 'capital-inflows',
    name: 'Capital Inflows',
    description: 'Capital inflows as a percentage of GDP, representing foreign investment in domestic assets.',
    category: 'inflationary',
    unit: '%',
    source: 'Bureau of Economic Analysis',
    data: generateHistoricalData(1900, 2023, 0, 15, 'cycle')
  },
  {
    id: 'capital-outflows',
    name: 'Capital Outflows',
    description: 'Capital outflows as a percentage of GDP, representing domestic investment in foreign assets.',
    category: 'inflationary',
    unit: '%',
    source: 'Bureau of Economic Analysis',
    data: generateHistoricalData(1900, 2023, 0, 12, 'cycle')
  },
  {
    id: 'fx-reserves',
    name: 'Foreign Exchange Reserves',
    description: 'Foreign exchange reserves as a percentage of GDP, representing the country\'s buffer against external shocks.',
    category: 'inflationary',
    unit: '%',
    source: 'Federal Reserve',
    data: generateHistoricalData(1900, 2023, 1, 25, 'cycle')
  },
  {
    id: 'equity-local',
    name: 'Equity Prices (Local Currency)',
    description: 'Stock market performance measured in local currency.',
    category: 'inflationary',
    unit: 'index',
    source: 'S&P Dow Jones Indices',
    data: generateHistoricalData(1900, 2023, 10, 5000, 'up')
  },
  {
    id: 'equity-foreign',
    name: 'Equity Prices (Foreign Currency)',
    description: 'Stock market performance measured in foreign currency (e.g., USD for non-US markets).',
    category: 'inflationary',
    unit: 'index',
    source: 'S&P Dow Jones Indices',
    data: generateHistoricalData(1900, 2023, 10, 4500, 'up')
  },
  {
    id: 'debt-service-inf',
    name: 'Debt Service Payments',
    description: 'Debt service payments as a percentage of GDP, representing the burden of debt on the economy.',
    category: 'both',
    unit: '%',
    source: 'Bank for International Settlements',
    data: generateHistoricalData(1900, 2023, 5, 35, 'cycle')
  },
  {
    id: 'gdp-growth-inf',
    name: 'GDP Growth Rates',
    description: 'Annual percentage change in real Gross Domestic Product.',
    category: 'both',
    unit: '%',
    source: 'Bureau of Economic Analysis',
    data: generateHistoricalData(1900, 2023, -15, 20, 'cycle')
  }
];

// Combined metrics
export const allMetrics: Metric[] = [...deflationaryMetrics, ...inflationaryMetrics.filter(m => m.category === 'inflationary')];

// Helper function to get metrics by category
export const getMetricsByCategory = (category: 'deflationary' | 'inflationary' | 'both'): Metric[] => {
  if (category === 'both') {
    return allMetrics;
  }
  
  return allMetrics.filter(metric => 
    metric.category === category || metric.category === 'both'
  );
}; 