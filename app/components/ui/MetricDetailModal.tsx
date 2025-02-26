'use client';

import React, { useEffect } from 'react';
import { MetricDetailModalProps } from '@/app/types';
import Modal from './Modal';
import LineChart from '../charts/LineChart';
import { useMetricData } from '@/app/hooks/useMetricData';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function MetricDetailModal({ metric, isOpen, onClose }: MetricDetailModalProps) {
  if (!metric) return null;
  
  // Fetch real-time data for the selected metric
  const { 
    metric: realDataMetric, 
    isLoading, 
    error 
  } = useMetricData(metric.id);
  
  // Use the real data metric if available, otherwise use the provided metric
  const displayMetric = realDataMetric || metric;

  // Determine if we're showing real or mock data
  const isRealData = realDataMetric && realDataMetric.source.includes('FRED');
  
  // Determine the color based on the metric category
  const getColor = () => {
    switch (displayMetric.category) {
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
  
  const color = getColor();
  
  // Calculate some basic statistics
  const values = displayMetric.data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  const currentValue = [...displayMetric.data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayMetric.name}
      size="lg"
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
            <p>Loading real-time data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-destructive mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Error loading real-time data</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <p className="text-xs mt-2">Showing simulated data instead.</p>
            </div>
          </div>
        )}
        
        {!isLoading && isRealData && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start">
            <div className="text-xs">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Real Data</span>
              <p className="mt-2">
                This chart shows real economic data from the Federal Reserve Economic Data (FRED).
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-6 justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Overview</h3>
            <p className="text-muted-foreground mb-4">
              {displayMetric.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Current Value</div>
                <div className="text-xl font-medium mt-1">{currentValue}{displayMetric.unit}</div>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Minimum</div>
                <div className="text-xl font-medium mt-1">{min.toFixed(2)}{displayMetric.unit}</div>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Maximum</div>
                <div className="text-xl font-medium mt-1">{max.toFixed(2)}{displayMetric.unit}</div>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">Average</div>
                <div className="text-xl font-medium mt-1">{avg.toFixed(2)}{displayMetric.unit}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Source</div>
              <div>{displayMetric.source}</div>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <h3 className="text-lg font-medium mb-2">Historical Data</h3>
          <LineChart 
            data={displayMetric.data}
            title={displayMetric.name} 
            unit={displayMetric.unit}
            color={color}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Debt Cycle Relevance</h3>
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div 
                className={`px-2 py-0.5 rounded-full text-xs ${
                  displayMetric.category === 'deflationary' 
                    ? 'bg-deflationary/10 text-deflationary' 
                    : displayMetric.category === 'inflationary' 
                      ? 'bg-inflationary/10 text-inflationary' 
                      : 'bg-primary/10 text-primary'
                }`}
              >
                {displayMetric.category === 'both' ? 'Both Cycles' : 
                 displayMetric.category === 'deflationary' ? 'Deflationary Cycle' : 'Inflationary Cycle'}
              </div>
            </div>
            
            <p className="text-muted-foreground">
              {displayMetric.category === 'both' 
                ? `This metric is significant in both deflationary and inflationary debt cycles, as outlined in Ray Dalio's Principles for Navigating Big Debt Crises.`
                : displayMetric.category === 'deflationary'
                  ? `This metric is particularly important during deflationary debt cycles, where debt burdens become heavier in real terms as asset prices and incomes fall.`
                  : `This metric is particularly important during inflationary debt cycles, where debt burdens are reduced in real terms through currency devaluation and inflation.`
              }
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
} 