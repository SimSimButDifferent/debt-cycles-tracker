export type MetricCategory = 'deflationary' | 'inflationary' | 'both' | 'monetary' | 'financial' | 'economic' | 'debt' | 'consumer';
export type TrendStatus = 'positive' | 'negative' | 'warning' | 'neutral';

export enum MetricType {
  DEFLATIONARY = 'deflationary',
  INFLATIONARY = 'inflationary',
  BOTH = 'both'
}

export enum MetricGroup {
  ECONOMIC_GROWTH = 'economic-growth',
  INFLATION = 'inflation',
  LABOR_MARKET = 'labor-market',
  CREDIT = 'credit',
  INTEREST_RATES = 'interest-rates',
  ASSET_PRICES = 'asset-prices',
  MONETARY_POLICY = 'monetary-policy',
  FISCAL_POLICY = 'fiscal-policy'
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: string;
  name: string;
  title: string;
  description: string;
  category: MetricCategory;
  unit: string;
  source: string;
  data: DataPoint[];
  isPercentage?: boolean;
  trendStatus?: TrendStatus;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  trendDescription?: string;
}

export interface ChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
  minimal?: boolean;
}

export interface MetricCardProps {
  metric: Metric;
  onClick: (metric: Metric) => void;
}

export interface MetricDetailModalProps {
  metric: Metric | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface TabsProps {
  defaultValue: string;
  tabs: {
    value: string;
    label: string;
  }[];
  children: React.ReactNode;
} 