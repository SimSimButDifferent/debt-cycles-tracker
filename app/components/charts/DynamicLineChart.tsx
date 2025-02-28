'use client';

import dynamic from 'next/dynamic';
import { ChartProps } from '@/app/types';

// Dynamically import the LineChart component with SSR disabled
// This prevents hydration mismatches by only loading the chart on the client side
const LineChart = dynamic(
  () => import('./LineChart'),
  { 
    loading: () => (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted/20 rounded">
        <div className="text-muted-foreground text-sm">Chart loading...</div>
      </div>
    ),
    ssr: false // Disable server-side rendering
  }
);

// Simple wrapper component that passes props to the dynamic component
export default function DynamicLineChart(props: ChartProps) {
  return <LineChart {...props} />;
} 