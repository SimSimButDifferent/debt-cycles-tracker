'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartProps } from '@/app/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineChart({ 
  data, 
  title, 
  unit, 
  color = 'rgb(75, 192, 192)',
  minimal = false 
}: ChartProps) {
  // Use state to control client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Only render the chart on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Create a placeholder component for server-side rendering
  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted/20 rounded">
        <div className="text-muted-foreground text-sm">Chart loading...</div>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extract labels (dates) and values
  const labels = sortedData.map(d => {
    // Format date more clearly - for minimal mode, just show year
    const date = new Date(d.date);
    return minimal ? date.getFullYear().toString() : d.date;
  });
  const values = sortedData.map(d => d.value);
  
  // Prepare data for Chart.js
  const chartData = {
    labels,
    datasets: [
      {
        label: `${title} (${unit})`,
        data: values,
        borderColor: color,
        backgroundColor: `${color}10`, // Very transparent background
        tension: 0.2,
        fill: false,
        pointRadius: minimal ? 0 : 1, // Hide points in minimal mode
        borderWidth: minimal ? 1 : 2,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Always hide legend to match screenshot
      },
      title: {
        display: !minimal, // Only show title in full mode
        text: title,
        color: '#f8fafc', // Light text for dark background
        font: {
          size: minimal ? 10 : 14
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label = label.split(' (')[0]; // Remove unit from label
            }
            if (context.parsed.y !== null) {
              label += ': ' + context.parsed.y.toFixed(2) + (unit ? ` ${unit}` : '');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        display: !minimal, // Hide y-axis in minimal mode
        title: {
          display: false, // Don't show axis titles to match screenshot
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Very light grid lines
          display: !minimal,
        },
        ticks: {
          color: '#94a3b8', // Muted foreground color for ticks
          display: !minimal
        }
      },
      x: {
        display: !minimal, // Hide x-axis in minimal mode
        title: {
          display: false, // Don't show axis titles to match screenshot
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Very light grid lines
          display: !minimal,
        },
        ticks: {
          color: '#94a3b8', // Muted foreground color for ticks
          display: !minimal,
          maxRotation: 0, // Don't rotate labels
          autoSkip: true, // Skip labels that don't fit
          maxTicksLimit: 8 // Limit number of ticks to avoid overcrowding
        }
      }
    },
    elements: {
      line: {
        borderWidth: minimal ? 1 : 2,
      },
      point: {
        radius: minimal ? 0 : 1, // Hide points in minimal mode for cleaner look
        hoverRadius: minimal ? 2 : 3,
      }
    }
  };

  return (
    <div className={`w-full h-full ${minimal ? '' : 'min-h-[300px]'}`}>
      <Line options={options} data={chartData} />
    </div>
  );
} 