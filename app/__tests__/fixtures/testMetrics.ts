import { MetricType, MetricGroup } from '../../types';

/**
 * Test metrics for database testing
 * These are a small subset of the actual metrics used in the application
 * Just enough for testing database functionality
 */
export const testMetrics = [
  {
    id: 'gdp',
    title: 'GDP',
    subTitle: 'Gross Domestic Product',
    description: 'The total value of goods and services produced within a country in a specific time period.',
    type: MetricType.DEFLATIONARY,
    group: MetricGroup.ECONOMIC_GROWTH
  },
  {
    id: 'cpi',
    title: 'CPI',
    subTitle: 'Consumer Price Index',
    description: 'A measure of the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.',
    type: MetricType.INFLATIONARY,
    group: MetricGroup.INFLATION
  },
  {
    id: 'unrate',
    title: 'Unemployment Rate',
    subTitle: 'Unemployment Rate',
    description: 'The percentage of the total labor force that is unemployed but actively seeking employment and willing to work.',
    type: MetricType.DEFLATIONARY,
    group: MetricGroup.LABOR_MARKET
  }
]; 

// Add a dummy test so Jest doesn't complain about missing tests in this file
if (process.env.NODE_ENV === 'test') {
  describe('TestMetrics', () => {
    it('contains test metric data', () => {
      expect(testMetrics.length).toBeGreaterThan(0);
    });
  });
} 