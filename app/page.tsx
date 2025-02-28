'use client';

import React, { useState } from 'react';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import MetricCard from './components/ui/MetricCard';
import MetricDetailModal from './components/ui/MetricDetailModal';
import Tabs from './components/ui/Tabs';
import { TabPanel } from './components/ui/Tabs';
import { Metric } from './types/metrics';
import { useCategoryMetrics } from './hooks/useMetricData';
import MetricsLoading from './components/ui/MetricsLoading';
import MetricsError from './components/ui/MetricsError';

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Fetch different categories of metrics
  const deflationary = useCategoryMetrics('deflationary');
  const inflationary = useCategoryMetrics('inflationary');
  const both = useCategoryMetrics('both');
  
  // Handle metric click to show details
  const handleMetricClick = (metric: Metric) => {
    setSelectedMetric(metric);
    setModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Helper function to render the metrics grid
  const renderMetricsGrid = (metrics: Metric[], isLoading: boolean, error: string | null) => {
    if (isLoading) {
      return <MetricsLoading />;
    }
    
    if (error) {
      return <MetricsError error={error} />;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <MetricCard 
            key={metric.id}
            metric={metric}
            onClick={handleMetricClick}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Debt Cycles Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tracking key economic metrics from Ray Dalio's Principles for Navigating Big Debt Crises
          </p>
          
          <Tabs 
            defaultTab="all" 
            tabs={[
              { id: 'all', label: 'All Metrics' },
              { id: 'deflationary', label: 'Deflationary Indicators' },
              { id: 'inflationary', label: 'Inflationary Indicators' }
            ]}
          >
            <TabPanel id="all">
              {renderMetricsGrid(both.metrics, both.isLoading, both.error)}
            </TabPanel>
            
            <TabPanel id="deflationary">
              {renderMetricsGrid(deflationary.metrics, deflationary.isLoading, deflationary.error)}
            </TabPanel>
            
            <TabPanel id="inflationary">
              {renderMetricsGrid(inflationary.metrics, inflationary.isLoading, inflationary.error)}
            </TabPanel>
          </Tabs>
        </section>
      </main>
      
      <Footer />
      
      <MetricDetailModal 
        metric={selectedMetric}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
