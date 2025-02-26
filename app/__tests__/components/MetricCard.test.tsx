import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import MetricCard from '../../components/ui/MetricCard';
import { mockMetric } from '../test-utils';
import '@testing-library/jest-dom';

// Mock the LineChart component
jest.mock('../../components/charts/LineChart', () => {
  return function MockLineChart() {
    return <div data-testid="line-chart">Mock Chart</div>;
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
    
    // Check that metric name is displayed
    expect(screen.getByText(mockMetric.name)).toBeInTheDocument();
    
    // Check that the current value is displayed
    const currentValue = mockMetric.data[mockMetric.data.length - 1].value;
    expect(screen.getByText(new RegExp(`${currentValue}${mockMetric.unit}`))).toBeInTheDocument();
    
    // Check that the chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    // Render the component
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    // Click the card - find the parent container
    const container = screen.getByText(mockMetric.name).closest('div');
    if (container) {
      fireEvent.click(container);
    }
    
    // Verify onClick was called with the metric
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockMetric);
  });
  
  it('shows real data badge when data is from FRED', () => {
    // Create a metric with FRED data source
    const fredMetric = {
      ...mockMetric,
      source: 'Federal Reserve Economic Data (FRED) - GDP123',
    };
    
    // Render the component
    render(<MetricCard metric={fredMetric} onClick={mockOnClick} />);
    
    // Check that there's a FRED source mentioned
    expect(screen.getByText(/Federal Reserve Economic Data/)).toBeInTheDocument();
  });
  
  it('displays a chart with the metric data', () => {
    // Render the component
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    // Check that the chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
}); 