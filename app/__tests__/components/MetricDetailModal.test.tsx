import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import MetricDetailModal from '../../components/ui/MetricDetailModal';
import { mockMetric } from '../test-utils';
import { useMetricData } from '../../hooks/useMetricData';
import '@testing-library/jest-dom';

// Mock the LineChart component
jest.mock('../../components/charts/LineChart', () => {
  return function MockLineChart() {
    return <div data-testid="line-chart">Mock Chart</div>;
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
      metric: null,
      isLoading: false,
      error: null,
      status: 'idle',
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
    expect(screen.queryByText(mockMetric.name)).not.toBeInTheDocument();
  });
  
  it('renders the modal with correct metric data', () => {
    // Setup - mock the hook to return no real data
    mockedUseMetricData.mockReturnValue({
      metric: null,
      isLoading: false,
      error: null,
      status: 'success',
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that metric name is displayed in the title
    expect(screen.getByText(mockMetric.name)).toBeInTheDocument();
    
    // Check that the description is displayed
    expect(screen.getByText(mockMetric.description)).toBeInTheDocument();
    
    // Check that the source is displayed
    expect(screen.getByText(mockMetric.source)).toBeInTheDocument();
    
    // Check that the line chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('shows loading state when fetching real data', () => {
    // Setup - mock the hook to return loading state
    mockedUseMetricData.mockReturnValue({
      metric: null,
      isLoading: true,
      error: null,
      status: 'loading',
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that loading message is displayed
    expect(screen.getByText('Loading real-time data...')).toBeInTheDocument();
  });
  
  it('shows error message when data fetching fails', () => {
    // Setup - mock the hook to return error state
    mockedUseMetricData.mockReturnValue({
      metric: null,
      isLoading: false,
      error: 'Failed to fetch data',
      status: 'error',
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Check that error message is displayed
    expect(screen.getByText('Error loading real-time data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.getByText('Showing simulated data instead.')).toBeInTheDocument();
  });
  
  it('shows FRED data source when using real data', () => {
    // Create a metric with FRED data source
    const fredMetric = {
      ...mockMetric,
      source: 'Federal Reserve Economic Data (FRED) - GDP123',
    };
    
    // Setup - mock the hook to return real data
    mockedUseMetricData.mockReturnValue({
      metric: fredMetric,
      isLoading: false,
      error: null,
      status: 'success',
    });
    
    // Render the component
    render(
      <MetricDetailModal 
        metric={mockMetric} 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    // Fix: Be more specific when looking for FRED source text
    // Use queryAllByText and check that at least one element exists
    const fredElements = screen.queryAllByText(/Federal Reserve Economic Data/);
    expect(fredElements.length).toBeGreaterThan(0);
    
    // Alternative: Look for the specific source text
    expect(screen.getByText('Federal Reserve Economic Data (FRED) - GDP123')).toBeInTheDocument();
  });
}); 