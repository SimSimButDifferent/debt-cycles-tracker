export type MetricCategory = 'deflationary' | 'inflationary' | 'both';

export interface DataPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  category: MetricCategory;
  unit: string;
  source: string;
  data: DataPoint[];
}

export interface ChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
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