// Data Models

export interface FinancialMetric {
  label: string;
  value: string;
  change: number; // percentage, e.g., 5.4 or -2.1
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  profit: number;
  stockPrice: number;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Competitor {
  name: string;
  marketShare: string;
  marketShareTrend?: 'up' | 'down' | 'stable';
  advantage: string;
  recentFunding?: string;
  lastEarningsReport?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface CompanyProfile {
  name: string;
  ticker: string;
  sector: string;
  description: string;
  ceo: string;
  headquarters: string;
  founded: string;
  website: string;
}

export interface AnalysisResult {
  profile: CompanyProfile;
  metrics: FinancialMetric[];
  chartData: ChartDataPoint[];
  swot: SWOT;
  competitors: Competitor[];
  recentNews: NewsItem[];
  executiveSummary: string;
  sourceUrls?: string[]; // For grounding
}

export enum AppState {
  LANDING,
  LOADING,
  DASHBOARD,
  ERROR
}