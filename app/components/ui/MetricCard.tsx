'use client';

import React, { useState, useEffect } from 'react';
import { Metric, MetricCategory } from '@/app/types/metrics';
import DynamicLineChart from '../charts/DynamicLineChart';

interface MetricCardProps {
  metric: Metric;
  onClick?: (metric: Metric) => void;
}

export default function MetricCard({ metric, onClick }: MetricCardProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true on component mount (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get the last data point to display the current value
  const lastDataPoint = metric.data.length > 0 
    ? [...metric.data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] 
    : null;
    
  // Only show the last 50 data points for the preview chart
  const chartData = [...metric.data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-50);
  
  // Helper function to determine the color class based on metric category
  const getCategoryClass = () => {
    const category = metric.category;
    
    switch (category) {
      case 'economic':
        return 'bg-green-500/10 text-green-400 border-green-700';
      case 'financial':
        return 'bg-blue-500/10 text-blue-400 border-blue-700';
      case 'monetary':
        return 'bg-purple-500/10 text-purple-400 border-purple-700';
      case 'debt':
        return 'bg-red-500/10 text-red-400 border-red-700';
      case 'consumer':
        return 'bg-orange-500/10 text-orange-400 border-orange-700';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };
  
  // Helper function to get chart color based on category
  const getChartColor = () => {
    const category = metric.category;
    
    switch (category) {
      case 'economic':
        return 'rgb(74, 222, 128)'; // light green
      case 'financial':
        return 'rgb(96, 165, 250)'; // light blue
      case 'monetary':
        return 'rgb(192, 132, 252)'; // light purple
      case 'debt':
        return 'rgb(248, 113, 113)'; // light red
      case 'consumer':
        return 'rgb(251, 146, 60)'; // light orange
      default:
        return 'rgb(148, 163, 184)'; // gray
    }
  };
  
  // Format the value with the appropriate unit
  const formatValue = (value: number) => {
    if (metric.isPercentage) {
      return `${value.toFixed(2)}%`;
    }
    return `${value.toFixed(2)}${metric.unit || ''}`;
  };

  // Helper function to format ID into a readable title
  const formatIdToTitle = (id: string): string => {
    // Handle camelCase, snake_case and kebab-case
    return id
      // Insert space before capital letters for camelCase
      .replace(/([A-Z])/g, ' $1')
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, ' ')
      // Capitalize first letter of each word
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  // Determine title to display, use a formatted ID if title is missing
  const displayTitle = metric.title || (metric.id ? formatIdToTitle(metric.id) : 'Economic Metric');
  
  return (
    <div 
      className="relative flex flex-col h-full border border-gray-700 rounded-lg p-4 bg-[#1e293b] hover:bg-[#273548] transition-colors cursor-pointer"
      onClick={() => onClick && onClick(metric)}
    >
      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-100">{displayTitle}</h3>
        
        {/* Current value */}
        {lastDataPoint && (
          <div className="mt-1 text-xl font-bold text-gray-100">
            {formatValue(lastDataPoint.value)}
          </div>
        )}
      </div>
      
      {/* Category badge */}
      <div className="mt-2 mb-3">
        <span className={`inline-block px-2 py-1 text-xs rounded-md ${getCategoryClass()}`}>
          {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{metric.description}</p>
      
      {/* Source */}
      <div className="text-xs text-gray-500 mb-4">
        Source: {metric.source?.includes('FRED') ? 'Federal Reserve Economic Data (FRED)' : metric.source}
      </div>
      
      {/* Chart - only render on client side */}
      {isClient && chartData.length > 0 && (
        <div className="h-24 mt-auto">
          <DynamicLineChart 
            data={chartData} 
            title={displayTitle}
            unit={metric.unit || ''}
            color={getChartColor()}
            minimal={true}
          />
        </div>
      )}
    </div>
  );
} 