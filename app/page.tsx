'use client';

import React, { useState } from 'react';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import Tabs, { TabPanel } from './components/ui/Tabs';
import MetricCard from './components/ui/MetricCard';
import MetricDetailModal from './components/ui/MetricDetailModal';
import { Metric } from './types';
import { useCategoryMetrics } from './hooks/useMetricData';
import MetricsLoading from './components/ui/MetricsLoading';
import MetricsError from './components/ui/MetricsError';

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Use our custom hooks to fetch real data
  const { 
    metrics: deflationaryMetrics, 
    isLoading: isDeflationaryLoading,
    error: deflationaryError
  } = useCategoryMetrics('deflationary');
  
  const { 
    metrics: inflationaryMetrics, 
    isLoading: isInflationaryLoading,
    error: inflationaryError
  } = useCategoryMetrics('inflationary');

  const handleMetricClick = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Debt Cycles Dashboard</h1>
          <p className="text-muted-foreground max-w-3xl">
            Explore key economic metrics from Ray Dalio's "Principles for Navigating Big Debt Crises".
            This dashboard tracks indicators for both deflationary and inflationary debt cycles using U.S. data from 1900 onwards.
          </p>
          <div className="mt-4 text-sm text-primary">
            <strong>New:</strong> We now display real economic data from the Federal Reserve where available.
          </div>
        </div>
        
        <Tabs 
          defaultValue="deflationary" 
          tabs={[
            { value: 'deflationary', label: 'Deflationary Debt Dynamics' },
            { value: 'inflationary', label: 'Inflationary Debt Dynamics' },
          ]}
        >
          <TabPanel value="deflationary">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Deflationary Debt Dynamics</h2>
              <p className="text-muted-foreground">
                These metrics are relevant to deflationary debt cycles, where debt burdens become heavier in real terms
                as asset prices and incomes fall. Deflationary cycles typically occur in developed economies with
                established central banks and stable currencies.
              </p>
            </div>
            
            {isDeflationaryLoading ? (
              <MetricsLoading />
            ) : deflationaryError ? (
              <MetricsError error={deflationaryError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deflationaryMetrics.map((metric) => (
                  <MetricCard 
                    key={metric.id} 
                    metric={metric} 
                    onClick={handleMetricClick} 
                  />
                ))}
              </div>
            )}
          </TabPanel>
          
          <TabPanel value="inflationary">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Inflationary Debt Dynamics</h2>
              <p className="text-muted-foreground">
                These metrics are relevant to inflationary debt cycles, where debt burdens are reduced in real terms
                through currency devaluation and inflation. Inflationary cycles typically occur in emerging economies
                with high levels of foreign-denominated debt.
              </p>
            </div>
            
            {isInflationaryLoading ? (
              <MetricsLoading />
            ) : inflationaryError ? (
              <MetricsError error={inflationaryError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inflationaryMetrics.map((metric) => (
                  <MetricCard 
                    key={metric.id} 
                    metric={metric} 
                    onClick={handleMetricClick} 
                  />
                ))}
              </div>
            )}
          </TabPanel>
        </Tabs>
      </main>
      
      <Footer />
      
      <MetricDetailModal 
        metric={selectedMetric}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
