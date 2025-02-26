'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface MetricsErrorProps {
  error: string;
}

export default function MetricsError({ error }: MetricsErrorProps) {
  return (
    <div className="w-full py-8 rounded-lg border border-destructive/20 bg-destructive/5 flex flex-col items-center text-center px-4">
      <ExclamationTriangleIcon className="w-10 h-10 text-destructive mb-4" />
      <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
      <p className="text-muted-foreground mb-4 max-w-lg">
        We encountered a problem fetching the real economic data. 
        The dashboard will display simulated data instead.
      </p>
      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-4">
        {error}
      </div>
      <p className="text-sm">
        Refresh the page to try again, or contact support if the problem persists.
      </p>
    </div>
  );
} 