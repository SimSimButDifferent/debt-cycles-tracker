'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchFredData, FRED_SERIES_MAP } from '../services/fredApiClient';
import { getCachedFredData } from '../database/fredDataService';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

/**
 * API Test Page
 * This page is used to test the API and database connections
 */
export default function ApiTestPage() {
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [dbResult, setDbResult] = useState<any>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  
  const testDirectApi = async () => {
    setApiResult(null);
    setApiError(null);
    setIsApiLoading(true);
    
    try {
      // Test API using the GDPC1 series (Real GDP)
      const data = await fetchFredData('GDPC1');
      
      setApiResult({
        series: 'GDPC1',
        points: data.length,
        firstPoint: data[0],
        lastPoint: data[data.length - 1]
      });
    } catch (error) {
      console.error('API Test Error:', error);
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsApiLoading(false);
    }
  };
  
  // Note: This function will only work on the server side
  // We can't directly call it from client components
  const testFredDataService = async () => {
    setDbResult({ message: "Database operations can only be performed on the server side. Please use the API route instead." });
    setDbError(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">API Test Page</h1>
        <p className="mb-4">
          This page tests connectivity to the FRED API and the database cache.
        </p>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test FRED API</h2>
          <button 
            onClick={testDirectApi}
            disabled={isApiLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded 
                     hover:bg-primary/90 transition-colors mb-4 disabled:opacity-50"
          >
            {isApiLoading ? 'Loading...' : 'Test API Connection'}
          </button>
          
          {apiError && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded mb-4">
              <p className="font-semibold text-destructive">Error:</p>
              <p className="text-destructive">{apiError}</p>
            </div>
          )}
          
          {apiResult && (
            <div className="p-4 bg-card border border-border rounded">
              <h3 className="font-semibold mb-2">API Result:</h3>
              <pre className="bg-secondary p-2 rounded overflow-x-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Database</h2>
          <button 
            onClick={testFredDataService}
            disabled={isDbLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded 
                     hover:bg-primary/90 transition-colors mb-4 disabled:opacity-50"
          >
            {isDbLoading ? 'Loading...' : 'Test Database Connection'}
          </button>
          
          {dbError && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded mb-4">
              <p className="font-semibold text-destructive">Error:</p>
              <p className="text-destructive">{dbError}</p>
            </div>
          )}
          
          {dbResult && (
            <div className="p-4 bg-card border border-border rounded">
              <h3 className="font-semibold mb-2">Database Result:</h3>
              <pre className="bg-secondary p-2 rounded overflow-x-auto">
                {JSON.stringify(dbResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div>
          <Link 
            href="/"
            className="text-primary hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 