import React, { ReactElement } from 'react';
import '@testing-library/jest-dom';
import { render, RenderOptions } from '@testing-library/react';
import { Metric, MetricCategory, TrendStatus } from '../types/metrics';

// Sample data for tests
export const mockDataPoint = {
  date: '2022-01-01',
  value: 100,
};

export const mockMetric: Metric = {
  id: 'test-metric',
  title: 'Test Metric',
  description: 'A metric for testing',
  category: 'economic' as MetricCategory,
  unit: '%',
  source: 'Mock Data',
  isPercentage: true,
  trendStatus: 'positive' as TrendStatus,
  frequency: 'monthly',
  data: [
    { date: '2020-01-01', value: 80 },
    { date: '2020-02-01', value: 85 },
    { date: '2020-03-01', value: 90 },
    { date: '2020-04-01', value: 95 },
    { date: '2020-05-01', value: 100 },
  ],
};

export const mockFredResponse = {
  observations: [
    { date: '2020-01-01', value: '1.5' },
    { date: '2020-02-01', value: '1.6' },
    { date: '2020-03-01', value: '1.7' },
    { date: '2020-04-01', value: '1.8' },
    { date: '2020-05-01', value: '1.9' },
  ],
};

// A custom render method that includes any global providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(ui, { ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { customRender as render }; 