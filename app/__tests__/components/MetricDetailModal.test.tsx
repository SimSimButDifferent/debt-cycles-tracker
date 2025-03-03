import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import MetricDetailModal from '../../components/ui/MetricDetailModal';
import { mockMetric } from '../test-utils';
import { useMetricData } from '../../hooks/useMetricData';
import '@testing-library/jest-dom';
import { Metric, MetricCategory, TrendStatus } from '@/app/types/metrics';

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

// Mock the useMetricData hook
jest.mock('../../hooks/useMetricData', () => ({
  useMetricData: jest.fn(),
}));

const mockedUseMetricData = useMetricData as jest.MockedFunction<typeof useMetricData>;

describe('MetricDetailModal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for the hook
    mockedUseMetricData.mockReturnValue({
      data: [],
      percentChange: [],
      isLoading: false,
      error: null,
    });
  });
  
  it('should not render anything when metric is null', () => {
    // Setup
    render(
      <MetricDetailModal 
        metric={null} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Since the component should return null, we can't assert on elements
    // Just verify that the modal's title is not in the document
    expect(screen.queryByText(mockMetric.title)).not.toBeInTheDocument();
  });
  
  it('renders the modal with correct metric data', () => {
    // Setup - mock the hook to return no real data
    mockedUseMetricData.mockReturnValue({
      data: [],
      percentChange: [],
      isLoading: false,
      error: null,
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that metric title is displayed in the title
    expect(screen.getByText(mockMetric.title)).toBeInTheDocument();
    
    // Check that the description is displayed
    expect(screen.getByText(mockMetric.description)).toBeInTheDocument();
    
    // Check that the source is displayed
    expect(screen.getByText(mockMetric.source, { exact: false })).toBeInTheDocument();
    
    // Check that the line chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('shows loading state when fetching real data', () => {
    // Setup - mock the hook to return loading state
    mockedUseMetricData.mockReturnValue({
      data: [],
      percentChange: [],
      isLoading: true,
      error: null,
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that loading spinner is displayed
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  it('shows error message when data fetching fails', () => {
    // Setup - mock the hook to return error state
    mockedUseMetricData.mockReturnValue({
      data: [],
      percentChange: [],
      isLoading: false,
      error: 'Failed to fetch data',
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that error message is displayed with partial text matching
    expect(screen.getByText(/Error loading data/)).toBeInTheDocument();
    // Use a more flexible approach to find the error message
    const errorElement = screen.getByText(/Error loading data/);
    expect(errorElement.textContent).toContain('Failed to fetch data');
    expect(screen.getByText(/Showing static data/)).toBeInTheDocument();
  });
  
  it('shows FRED data source when using real data', () => {
    // Create a metric with FRED data source
    const fredMetric: Metric = {
      id: 'test-fred-metric',
      title: 'FRED Test Metric',
      description: 'A metric for testing FRED data',
      category: 'economic',
      unit: '%',
      source: 'Federal Reserve Economic Data (FRED) - GDP123',
      frequency: 'monthly',
      isPercentage: true,
      trendStatus: 'positive',
      data: [
        { date: '2020-01-01', value: 80 },
        { date: '2020-02-01', value: 85 }
      ]
    };
    
    // Setup - mock the hook to return real data
    mockedUseMetricData.mockReturnValue({
      data: [
        { date: '2023-01-01', value: 100 },
        { date: '2023-02-01', value: 105 },
      ],
      percentChange: [
        { date: '2023-01-01', value: 2.5 },
        { date: '2023-02-01', value: 5.0 },
      ],
      isLoading: false,
      error: null,
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={fredMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check for FRED source text
    expect(screen.getByText('Federal Reserve Economic Data (FRED) - GDP123')).toBeInTheDocument();
    
    // Check for real data indicator
    expect(screen.getByText('Real FRED Data')).toBeInTheDocument();
  });
}); 