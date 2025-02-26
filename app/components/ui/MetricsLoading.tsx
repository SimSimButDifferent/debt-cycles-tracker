'use client';

import React from 'react';

export default function MetricsLoading() {
  return (
    <div className="w-full py-10 flex flex-col items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
      <p className="text-muted-foreground text-center">
        Loading real economic data from Federal Reserve...
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        This may take a moment to fetch and process the data.
      </p>
    </div>
  );
} 