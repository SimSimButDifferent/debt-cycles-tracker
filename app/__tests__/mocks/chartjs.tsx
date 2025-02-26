import React from 'react';
import { ChartProps } from '@/app/types';

// Mock for the LineChart component used in detail view
jest.mock('../../components/charts/LineChart', () => {
  return function MockLineChart({ data, title, unit, color }: ChartProps) {
    return (
      <div data-testid="mock-line-chart">
        <p>Mock Chart: {title}</p>
        <p>Data points: {data.length}</p>
        <p>Unit: {unit}</p>
        <p>Color: {color}</p>
      </div>
    );
  };
});

// Mock for the MiniChart component used in MetricCard
jest.mock('../../components/charts/LineChart', () => {
  return function MockMiniChart({ data, title, unit, color }: ChartProps) {
    return (
      <div data-testid="mini-chart">
        <p>Data points: {data.length}</p>
        <p>Color: {color}</p>
      </div>
    );
  };
}, { virtual: true });

// This file shouldn't be treated as a test file itself
// Export a dummy function to make ESLint happy
export const chartMocks = {
  mockLineChart: true,
}; 