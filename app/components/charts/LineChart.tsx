'use client';

import React from 'react';
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

export default function LineChart({ data, title, unit, color = 'rgb(75, 192, 192)' }: ChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extract labels (dates) and values
  const labels = sortedData.map(d => d.date);
  const values = sortedData.map(d => d.value);

  // Prepare data for Chart.js
  const chartData = {
    labels,
    datasets: [
      {
        label: `${title} (${unit})`,
        data: values,
        borderColor: color,
        backgroundColor: `${color}33`, // Add transparency
        tension: 0.2,
        fill: true,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label = label.split(' (')[0]; // Remove unit from label
            }
            if (context.parsed.y !== null) {
              label += ': ' + context.parsed.y + (unit ? ` ${unit}` : '');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: unit
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line options={options} data={chartData} />
    </div>
  );
} 