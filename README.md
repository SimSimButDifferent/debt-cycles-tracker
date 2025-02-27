# Debt Cycles Dashboard

A web-based dashboard for tracking and visualizing key economic metrics from Ray Dalio's "Principles for Navigating Big Debt Crises". This application displays interactive charts for metrics related to both deflationary and inflationary debt cycles, focusing on U.S. data from the 1900s onward.

## Features

- **Interactive Metrics Dashboard**: View and explore key economic indicators for deflationary and inflationary debt cycles
- **Detailed Metric Analysis**: Click on any metric to see detailed historical data and relevant statistics
- **Educational Content**: Learn about debt cycles and their impact on economic indicators
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Automatically adjusts to your system preferences
- **Data Caching**: Real FRED data is cached in a PostgreSQL database for better performance

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm or yarn
- PostgreSQL (v14 or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/debt-cycles.git
cd debt-cycles
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following:

```
NEXT_PUBLIC_FRED_API_KEY=your_fred_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/debt_cycles
```

You can obtain a FRED API key from [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html).

4. Set up the database:

```bash
# Run the database bootstrap script to set up and seed the database
npm run db:bootstrap

# Alternatively, you can run the individual commands:
npm run db:setup     # Run Prisma migrations and generate client
npm run seed         # Seed the database with FRED data
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Application source code (Next.js App Router)
  - `components/`: React components
    - `charts/`: Chart components
    - `ui/`: UI components (cards, modals, etc.)
  - `data/`: Data sources and mock data generators
  - `types/`: TypeScript type definitions
  - `about/`: About page
  - `database/`: Database services and models
  - `services/`: API services
  - `hooks/`: React hooks
  - `__tests__/`: Test files
- `public/`: Static assets
- `scripts/`: Utility scripts for database setup and seeding
- `prisma/`: Prisma schema and migrations
- `tailwind.config.ts`: Tailwind CSS configuration

## Database

The application uses PostgreSQL with Prisma ORM to cache data from the FRED API. This improves performance and reduces API calls.

### Database Commands

```bash
npm run db:setup        # Set up database (run migrations + generate Prisma client)
npm run db:migrate      # Run Prisma migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio to view/edit database
npm run seed            # Seed the database with FRED data
npm run seed:test       # Seed the database with test data for testing
npm run db:bootstrap    # Full database setup (reset + migrate + seed + test)
```

For more detailed information about the database, see [DATABASE.md](DATABASE.md).

## Testing

The application includes comprehensive tests for components, hooks, and services.

```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report
./scripts/test-database.sh  # Run database-specific tests
```

For more detailed information about testing, see [TESTING.md](TESTING.md).

## Data Sources

The primary data source for this dashboard is the Federal Reserve Economic Data (FRED) API. In development and test environments, cached mock data may be used.

Real data is fetched from:

- Federal Reserve Economic Data (FRED)

## Acknowledgements

This project is inspired by Ray Dalio's book "Principles for Navigating Big Debt Crises". It is intended for educational purposes only and is not affiliated with Bridgewater Associates or Ray Dalio.

## License

MIT
