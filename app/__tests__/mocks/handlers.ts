import { rest } from 'msw';
import { mockFredResponse } from '../test-utils';

// FRED API Base URL
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

export const handlers = [
  // Mock the FRED API
  rest.get(FRED_API_BASE_URL, (req, res, ctx) => {
    const seriesId = req.url.searchParams.get('series_id');
    
    // Return success response with mock data
    return res(
      ctx.status(200),
      ctx.json(mockFredResponse)
    );
  }),
  
  // Mock response for a specific series (could add more if needed)
  rest.get(`${FRED_API_BASE_URL}`, (req, res, ctx) => {
    const seriesId = req.url.searchParams.get('series_id');
    
    if (seriesId === 'ERROR_SERIES') {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      );
    }
    
    if (seriesId === 'EMPTY_SERIES') {
      return res(
        ctx.status(200),
        ctx.json({ observations: [] })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(mockFredResponse)
    );
  }),
]; 