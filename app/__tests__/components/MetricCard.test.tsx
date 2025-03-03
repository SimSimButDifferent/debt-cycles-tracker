import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import MetricCard from '../../components/ui/MetricCard';
import { mockMetric } from '../test-utils';
import { Metric } from '@/app/types/metrics';
import '@testing-library/jest-dom';

// Mock the DynamicLineChart component
jest.mock('../../components/charts/DynamicLineChart', () => {
  return function MockDynamicLineChart() {
    return <div data-testid="line-chart">Mock Chart</div>;
  };
});

// Mock useState for isClient to always return true
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn().mockImplementation((initialValue) => {
      // Special case for isClient state - always return true
      if (initialValue === false) {
        return [true, jest.fn()];
      }
      // For all other useState calls, use the actual implementation
      return originalReact.useState(initialValue);
    }),
  };
});

describe('MetricCard Component', () => {
  const mockOnClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the metric card with correct data', () => {
    // Render the component
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    // Check that metric title is displayed
    expect(screen.getByText(mockMetric.title)).toBeInTheDocument();
    
    // Check that the current value is displayed
    const currentValue = mockMetric.data[mockMetric.data.length - 1].value;
    expect(screen.getByText(new RegExp(`${currentValue.toFixed(2)}%`))).toBeInTheDocument();
    
    // Check that the chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    // Render the component
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    // Click the card - find the parent container
    const container = screen.getByText(mockMetric.title).closest('div');
    if (container) {
      fireEvent.click(container);
    }
    
    // Verify onClick was called with the metric
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockMetric);
  });
  
  it('shows real data badge when data is from FRED', () => {
    // Create a metric with FRED data source
    const fredMetric: Metric = {
      id: 'fred-test-metric',
      title: 'FRED Test Metric',
      description: 'A metric for testing with FRED source',
      category: 'economic',
      unit: '%',
      source: 'FRED',
      frequency: 'monthly',
      data: [
        { date: '2020-01-01', value: 80 },
        { date: '2020-02-01', value: 85 }
      ],
      isPercentage: true,
      trendStatus: 'positive'
    };
    
    // Render the component
    render(<MetricCard metric={fredMetric} onClick={mockOnClick} />);
    
    // Check that there's a FRED source text
    expect(screen.getByText(/Federal Reserve Economic Data/)).toBeInTheDocument();
  });
  
  it('displays a chart with the metric data', () => {
    // Render the component
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    // Check that the chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
}); 