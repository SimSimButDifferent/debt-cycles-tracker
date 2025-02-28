'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import DynamicLineChart from '../charts/DynamicLineChart';
import { Metric } from '@/app/types/metrics';
import { useMetricData } from '@/app/hooks/useMetricData';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { FRED_SERIES_MAP } from '@/app/services/fredApiClient';

export interface MetricDetailModalProps {
  metric: Metric | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetricDetailModal({ metric, isOpen, onClose }: MetricDetailModalProps) {
  // Only render content if we have a metric and are open
  if (!metric || !isOpen) return null;
  
  const [timeframe, setTimeframe] = useState<'all' | '1y' | '5y' | '10y' | '20y'>('all');
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get the FRED series ID for this metric
  const seriesId = FRED_SERIES_MAP[metric.id];
  
  // Fetch real-time data for the selected metric
  const { 
    data,
    isLoading, 
    error 
  } = useMetricData(seriesId, timeframe);
  
  // Determine if we're showing real data
  const hasRealData = !isLoading && !error && data.length > 0;
  
  // Determine the data to display based on availability
  const displayData = hasRealData ? data : metric.data;
  
  // Helper function to get color based on category
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
  
  // Format value for display
  const formatValue = (value: number) => {
    if (metric.isPercentage) {
      return `${value.toFixed(2)}%`;
    }
    return `${value.toFixed(2)}${metric.unit || ''}`;
  };
  
  // Get the last data point
  const getLastDataPoint = () => {
    if (displayData.length === 0) return null;
    
    return [...displayData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };
  
  const lastDataPoint = getLastDataPoint();
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={metric.title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Key Information */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Value */}
          {lastDataPoint && (
            <div className="flex-1 bg-[#1e293b] border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Current Value</h3>
              <div className="text-3xl font-bold text-gray-100">
                {formatValue(lastDataPoint.value)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(lastDataPoint.date).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {/* Description */}
          <div className="flex-1 bg-[#1e293b] border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
            <p className="text-sm text-gray-300">{metric.description}</p>
          </div>
        </div>
        
        {/* Data Source */}
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-1 font-semibold">Source:</span> 
          {metric.source}
          {hasRealData && (
            <span className="ml-2 px-2 py-1 text-xs rounded-md bg-blue-900/30 text-blue-300 border border-blue-800">
              Real FRED Data
            </span>
          )}
        </div>
        
        {/* Timeframe selector */}
        <div className="flex space-x-2 border-b border-gray-700 pb-4">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 text-sm rounded-md ${timeframe === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setTimeframe('20y')}
            className={`px-3 py-1.5 text-sm rounded-md ${timeframe === '20y' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            20Y
          </button>
          <button
            onClick={() => setTimeframe('10y')}
            className={`px-3 py-1.5 text-sm rounded-md ${timeframe === '10y' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            10Y
          </button>
          <button
            onClick={() => setTimeframe('5y')}
            className={`px-3 py-1.5 text-sm rounded-md ${timeframe === '5y' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            5Y
          </button>
          <button
            onClick={() => setTimeframe('1y')}
            className={`px-3 py-1.5 text-sm rounded-md ${timeframe === '1y' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            1Y
          </button>
        </div>
        
        {/* Chart Section */}
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-4">
          {isLoading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="h-64 flex flex-col items-center justify-center text-red-400 space-y-2">
              <ChartBarIcon className="w-10 h-10 text-red-400/50" />
              <p>Error loading data: {error}</p>
              <p className="text-sm text-gray-500">Showing static data instead</p>
            </div>
          )}
          
          {!isLoading && !error && isClient && displayData.length > 0 && (
            <div className="h-64">
              <DynamicLineChart 
                data={displayData}
                title={metric.title}
                unit={metric.unit || ''}
                color={getChartColor()}
                minimal={false}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
} 