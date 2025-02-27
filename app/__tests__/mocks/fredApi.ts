/**
 * Mock FRED API data for tests
 */

export const mockGdpData = [
  { date: '2023-01-01', value: 26000.31 },
  { date: '2023-04-01', value: 26489.39 },
  { date: '2023-07-01', value: 27060.87 },
  { date: '2023-10-01', value: 27350.07 },
  { date: '2024-01-01', value: 27600.82 },
  { date: '2024-04-01', value: 27971.63 }
];

export const mockCpiData = [
  { date: '2023-01-01', value: 300.84 },
  { date: '2023-02-01', value: 301.96 },
  { date: '2023-03-01', value: 302.84 },
  { date: '2023-04-01', value: 304.11 },
  { date: '2023-05-01', value: 305.43 },
  { date: '2023-06-01', value: 306.78 },
  { date: '2023-07-01', value: 307.26 },
  { date: '2023-08-01', value: 308.15 },
  { date: '2023-09-01', value: 308.91 },
  { date: '2023-10-01', value: 309.44 },
  { date: '2023-11-01', value: 309.92 },
  { date: '2023-12-01', value: 309.83 },
  { date: '2024-01-01', value: 310.64 },
  { date: '2024-02-01', value: 311.29 },
  { date: '2024-03-01', value: 312.15 }
];

export const mockUnrateData = [
  { date: '2023-01-01', value: 3.4 },
  { date: '2023-02-01', value: 3.6 },
  { date: '2023-03-01', value: 3.5 },
  { date: '2023-04-01', value: 3.4 },
  { date: '2023-05-01', value: 3.7 },
  { date: '2023-06-01', value: 3.6 },
  { date: '2023-07-01', value: 3.5 },
  { date: '2023-08-01', value: 3.8 },
  { date: '2023-09-01', value: 3.7 },
  { date: '2023-10-01', value: 3.9 },
  { date: '2023-11-01', value: 3.7 },
  { date: '2023-12-01', value: 3.7 },
  { date: '2024-01-01', value: 3.4 },
  { date: '2024-02-01', value: 3.9 },
  { date: '2024-03-01', value: 3.8 },
  { date: '2024-04-01', value: 3.9 }
];

// Mock API responses by metric ID/series ID
export const mockFredDataBySeriesId = {
  'GDPC1': mockGdpData,
  'CPIAUCSL': mockCpiData,
  'UNRATE': mockUnrateData
};

// Mock series info
export const mockFredSeriesInfo = {
  'GDPC1': {
    id: 'GDPC1',
    title: 'Real Gross Domestic Product',
    notes: 'Billions of Chained 2017 Dollars, Seasonally Adjusted Annual Rate',
    frequency: 'Quarterly',
    units: 'Billions of Chained 2017 Dollars',
    lastUpdated: '2023-12-21'
  },
  'CPIAUCSL': {
    id: 'CPIAUCSL',
    title: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
    notes: 'Index 1982-1984=100, Seasonally Adjusted',
    frequency: 'Monthly',
    units: 'Index 1982-1984=100',
    lastUpdated: '2023-12-12'
  },
  'UNRATE': {
    id: 'UNRATE',
    title: 'Unemployment Rate',
    notes: 'Percent, Seasonally Adjusted',
    frequency: 'Monthly',
    units: 'Percent',
    lastUpdated: '2023-12-08'
  }
}; 