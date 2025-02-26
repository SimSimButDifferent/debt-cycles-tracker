# Debt Cycles Dashboard

A web-based dashboard for tracking and visualizing key economic metrics from Ray Dalio's "Principles for Navigating Big Debt Crises". This application displays interactive charts for metrics related to both deflationary and inflationary debt cycles, focusing on U.S. data from the 1900s onward.

## Features

- **Interactive Metrics Dashboard**: View and explore key economic indicators for deflationary and inflationary debt cycles
- **Detailed Metric Analysis**: Click on any metric to see detailed historical data and relevant statistics
- **Educational Content**: Learn about debt cycles and their impact on economic indicators
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Automatically adjusts to your system preferences

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm or yarn

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

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Application source code (Next.js App Router)
  - `components/`: React components
    - `charts/`: Chart components
    - `ui/`: UI components (cards, modals, etc.)
  - `data/`: Data sources and mock data generators
  - `types/`: TypeScript type definitions
  - `about/`: About page
- `public/`: Static assets
- `tailwind.config.ts`: Tailwind CSS configuration

## Data Sources

The data displayed in this dashboard is generated using algorithms that simulate historical patterns based on actual economic trends. In a production environment, this would be replaced with real data from:

- Federal Reserve Economic Data (FRED)
- Bureau of Economic Analysis (BEA)
- Bureau of Labor Statistics (BLS)
- International Monetary Fund (IMF)
- Bank for International Settlements (BIS)
- S&P Dow Jones Indices
- Case-Shiller Home Price Index

## Acknowledgements

This project is inspired by Ray Dalio's book "Principles for Navigating Big Debt Crises". It is intended for educational purposes only and is not affiliated with Bridgewater Associates or Ray Dalio.

## License

MIT
