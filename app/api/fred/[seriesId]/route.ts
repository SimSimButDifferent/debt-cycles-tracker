import { NextRequest, NextResponse } from 'next/server';
import { getCachedFredData, cacheFredData, shouldFetchFromApi } from '@/app/database/fredDataService';
import { fetchFredData as fetchFredDataDirect } from '@/app/services/fredApi';

/**
 * GET handler for FRED data API
 * This is a server-side API route that handles fetching FRED data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    const seriesId = params.seriesId;
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const frequency = searchParams.get('frequency') || 'm';
    const cacheTTL = searchParams.get('cacheTTL') ? parseInt(searchParams.get('cacheTTL')!) : undefined;
    const metricId = searchParams.get('metricId') || seriesId;
    
    // Check if we should use cached data
    const shouldFetch = await shouldFetchFromApi(seriesId);
    
    // If we have fresh data in the cache, return it
    if (!shouldFetch) {
      const cachedData = await getCachedFredData(seriesId);
      if (cachedData && cachedData.length > 0) {
        return NextResponse.json({ data: cachedData, source: 'cache' });
      }
    }
    
    // Otherwise fetch from the FRED API
    const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    const data = await fetchFredDataDirect(
      seriesId,
      apiKey,
      fromDate,
      toDate,
      frequency as string,
      cacheTTL
    );
    
    // Cache the data if we got results
    if (data && data.length > 0) {
      await cacheFredData(
        seriesId,
        data,
        {
          metricId: metricId as string,
          name: seriesId,
          description: `FRED Series ${seriesId}`,
          unit: '%',
          frequency: frequency as string
        }
      );
    }
    
    return NextResponse.json({ data, source: 'api' });
  } catch (error) {
    console.error('Error fetching FRED data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FRED data' },
      { status: 500 }
    );
  }
} 