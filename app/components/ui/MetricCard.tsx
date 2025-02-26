'use client';

import React from 'react';
import { Metric, MetricCardProps } from '@/app/types';
import LineChart from '../charts/LineChart';

export default function MetricCard({ metric, onClick }: MetricCardProps) {
  // Determine the color based on the metric category
  const getColor = (category: Metric['category']): string => {
    switch (category) {
      case 'deflationary':
        return 'var(--deflationary)';
      case 'inflationary':
        return 'var(--inflationary)';
      case 'both':
        return 'var(--primary)';
      default:
        return 'var(--primary)';
    }
  };

  const color = getColor(metric.category);
  
  // Get the last data point for current value
  const lastDataPoint = [...metric.data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  return (
    <div 
      className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all p-4 cursor-pointer border border-border"
      onClick={() => onClick(metric)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{metric.name}</h3>
        <div 
          className={`text-xs px-2 py-0.5 rounded-full ${
            metric.category === 'deflationary' 
              ? 'bg-deflationary/10 text-deflationary' 
              : metric.category === 'inflationary' 
                ? 'bg-inflationary/10 text-inflationary' 
                : 'bg-primary/10 text-primary'
          }`}
        >
          {metric.category === 'both' ? 'Both' : 
           metric.category === 'deflationary' ? 'Deflationary' : 'Inflationary'}
        </div>
      </div>
      
      <div className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {metric.description}
      </div>
      
      <div className="h-48 mb-4">
        <LineChart 
          data={metric.data.slice(-50)} // Show last 50 data points for preview
          title={metric.name}
          unit={metric.unit}
          color={color}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm">
        <div className="text-muted-foreground">Source: {metric.source}</div>
        <div className="font-medium">
          Latest: <span className="text-card-foreground">{lastDataPoint.value}{metric.unit}</span> ({lastDataPoint.date})
        </div>
      </div>
    </div>
  );
} 