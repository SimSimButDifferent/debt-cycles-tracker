'use client';

/**
 * Utility for handling CORS proxying when needed
 * This helps with browser CORS restrictions when calling the FRED API directly
 */
const useCorsProxy = process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true';
const corsProxyUrl = process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'https://corsproxy.io/?';

/**
 * Applies a CORS proxy to a URL if configured to do so
 * @param url The original URL to potentially proxy
 * @returns The URL with CORS proxy if enabled, or the original URL
 */
export function applyCorsProxyIfNeeded(url: string): string {
  if (!useCorsProxy) {
    return url;
  }
  
  // Handle special case for corsproxy.io which uses a query parameter format
  if (corsProxyUrl.includes('corsproxy.io')) {
    // With corsproxy.io, the URL is a query parameter: https://corsproxy.io/?https://api.example.com
    return `${corsProxyUrl}${url}`;
  }
  
  // For other CORS proxies that use path format
  // Remove trailing slash from proxy URL if present
  const proxyBase = corsProxyUrl.endsWith('/') 
    ? corsProxyUrl.slice(0, -1) 
    : corsProxyUrl;
  
  return `${proxyBase}/${url}`;
} 