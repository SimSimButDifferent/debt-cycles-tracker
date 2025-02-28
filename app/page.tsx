'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import MetricCard from './components/ui/MetricCard';
import MetricDetailModal from './components/ui/MetricDetailModal';
import Tabs from './components/ui/Tabs';
import { TabPanel } from './components/ui/Tabs';
import { Metric } from './types/metrics';
import { fetchMetrics } from './services/metricService';
import MetricsLoading from './components/ui/MetricsLoading';
import MetricsError from './components/ui/MetricsError';

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // State for metrics data
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch metrics on component mount
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const metrics = await fetchMetrics();
        setAllMetrics(metrics);
      } catch (err) {
        console.error('Error loading metrics:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, []);
  
  // Filter metrics by category
  const economicMetrics = allMetrics.filter(m => m.category === 'economic');
  const financialMetrics = allMetrics.filter(m => m.category === 'financial');
  const monetaryMetrics = allMetrics.filter(m => m.category === 'monetary');
  const debtMetrics = allMetrics.filter(m => m.category === 'debt');
  const consumerMetrics = allMetrics.filter(m => m.category === 'consumer');
  
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
  const renderMetricsGrid = (metrics: Metric[]) => {
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
              { id: 'economic', label: 'Economic Indicators' },
              { id: 'financial', label: 'Financial Indicators' },
              { id: 'monetary', label: 'Monetary Indicators' },
              { id: 'debt', label: 'Debt Indicators' },
              { id: 'consumer', label: 'Consumer Indicators' }
            ]}
          >
            <TabPanel id="all">
              {renderMetricsGrid(allMetrics)}
            </TabPanel>
            
            <TabPanel id="economic">
              {renderMetricsGrid(economicMetrics)}
            </TabPanel>
            
            <TabPanel id="financial">
              {renderMetricsGrid(financialMetrics)}
            </TabPanel>
            
            <TabPanel id="monetary">
              {renderMetricsGrid(monetaryMetrics)}
            </TabPanel>
            
            <TabPanel id="debt">
              {renderMetricsGrid(debtMetrics)}
            </TabPanel>
            
            <TabPanel id="consumer">
              {renderMetricsGrid(consumerMetrics)}
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
