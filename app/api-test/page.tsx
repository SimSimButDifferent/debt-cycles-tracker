'use client';

import React, { useState } from 'react';
import { fetchFredData, FRED_SERIES_MAP } from '../services/fredApi';
import { applyCorsProxyIfNeeded } from '../services/corsProxy';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function ApiTestPage() {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState('GDPC1');
  
  // Function to test direct API access without the fetchFredData wrapper
  const testDirectApi = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    
    const API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;
    const baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
    
    // Prepare the API request URL with parameters
    const params = new URLSearchParams({
      series_id: selectedSeries,
      api_key: API_KEY!,
      file_type: 'json',
      observation_start: '2020-01-01',
      observation_end: new Date().toISOString().split('T')[0],
    });
    
    try {
      // Test the direct URL without any CORS proxy
      const directResponse = await fetch(`${baseUrl}?${params.toString()}`);
      
      if (!directResponse.ok) {
        throw new Error(`Direct API request failed with status: ${directResponse.status}`);
      }
      
      const data = await directResponse.json();
      setResults({
        method: 'Direct API call',
        url: `${baseUrl}?${params.toString()}`,
        data: data
      });
    } catch (err) {
      console.error('Error in direct API test:', err);
      setError(`Direct API error: ${err instanceof Error ? err.message : String(err)}`);
      
      // If direct call fails, try with the CORS proxy
      try {
        const proxyUrl = applyCorsProxyIfNeeded(`${baseUrl}?${params.toString()}`);
        const proxyResponse = await fetch(proxyUrl);
        
        if (!proxyResponse.ok) {
          throw new Error(`Proxy API request failed with status: ${proxyResponse.status}`);
        }
        
        const proxyData = await proxyResponse.json();
        setResults({
          method: 'CORS Proxy API call (fallback)',
          url: proxyUrl,
          data: proxyData
        });
        setError('Direct call failed, but proxy succeeded');
      } catch (proxyErr) {
        setError(`Both direct and proxy calls failed. Proxy error: ${proxyErr instanceof Error ? proxyErr.message : String(proxyErr)}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to test using our fetchFredData wrapper
  const testFredDataService = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const data = await fetchFredData(selectedSeries);
      setResults({
        method: 'fetchFredData Service',
        seriesId: selectedSeries,
        count: data.length,
        data: data
      });
    } catch (err) {
      console.error('Error in fetchFredData test:', err);
      setError(`fetchFredData error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">FRED API Test Page</h1>
        
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2"><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FRED_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <p className="mb-2"><strong>CORS Proxy:</strong> {process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true' ? '✅ Enabled' : '❌ Disabled'}</p>
              <p><strong>Proxy URL:</strong> {process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'Not configured'}</p>
            </div>
            <div>
              <label className="block mb-2">
                <span className="font-medium">Select Series:</span>
                <select 
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="ml-2 p-1 border border-input rounded"
                >
                  <option value="GDPC1">GDPC1 - Real GDP</option>
                  <option value="UNRATE">UNRATE - Unemployment Rate</option>
                  <option value="CPIAUCSL">CPIAUCSL - Consumer Price Index</option>
                  <option value="GFDEGDQ188S">GFDEGDQ188S - Federal Debt to GDP</option>
                  <option value="DFF">DFF - Federal Funds Rate</option>
                </select>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={testDirectApi}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Test Direct API
            </button>
            
            <button
              onClick={testFredDataService}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Test fetchFredData Service
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="mb-6 p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              <p>Loading...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}
        
        {results && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            <div className="p-4 bg-card rounded-lg border border-border overflow-auto max-h-[500px]">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Method: {results.method}</h3>
                {results.url && <p className="text-sm truncate"><strong>URL:</strong> {results.url}</p>}
                {results.seriesId && <p><strong>Series ID:</strong> {results.seriesId}</p>}
                {results.count !== undefined && <p><strong>Data Points:</strong> {results.count}</p>}
              </div>
              
              <details>
                <summary className="cursor-pointer text-primary font-medium py-2">
                  Show JSON Response
                </summary>
                <pre className="mt-2 p-2 bg-secondary text-secondary-foreground rounded-md text-xs overflow-auto">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 