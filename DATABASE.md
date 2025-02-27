# Database Setup and Usage

This document provides instructions for setting up and using the database for the Debt Cycles Dashboard.

## Overview

The application uses PostgreSQL with Prisma ORM to cache data from the FRED API. This improves performance and reduces API calls to external services.

## Database Models

The database schema includes the following models:

1. **FredSeries** - Information about FRED data series
2. **CachedFredData** - The actual data points for each series
3. **LastFetchTimestamp** - When each series was last updated

## Setup Instructions

### Prerequisites

- PostgreSQL installed and running
- Node.js and npm

### Configuration

1. Make sure your PostgreSQL server is running
2. Update the `.env` file with your database connection URL:

```
DATABASE_URL="postgresql://username:password@localhost:5432/debt_cycles?schema=public"
```

Replace `username`, `password` with your actual PostgreSQL credentials.

### Initialize the Database

Run the following commands to set up the database:

```bash
# Install dependencies
npm install

# Generate Prisma client and run migrations
npm run db:setup

# Seed the database with initial data
npm run seed
```

## Using the Database Service

The database service provides several functions for working with FRED data:

- `getCachedFredData(seriesId)` - Retrieves cached data for a FRED series
- `cacheFredData(seriesId, data, metricInfo)` - Stores FRED data in the database
- `shouldFetchFromApi(seriesId)` - Determines if new data should be fetched from the API
- `getFredSeriesForMetric(metricId)` - Gets the FRED series ID for a metric

## Development Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Run Prisma migrations for schema changes
npm run db:migrate

# Open Prisma Studio to view/edit database
npm run db:studio

# Run database seeding
npm run seed
```

## Testing

The database service has comprehensive tests:

```bash
# Run all tests
npm test

# Run only database tests
npm test -- -t "FRED.*Database"
```

## Troubleshooting

If you encounter issues with the database:

1. Check that PostgreSQL is running
2. Verify the DATABASE_URL in your `.env` file
3. Try running `npm run db:setup` again
4. Check the Prisma logs for more details
