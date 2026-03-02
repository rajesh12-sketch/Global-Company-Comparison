
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface PortfolioItem {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: number;
  addedAt: string;
  metrics?: FinancialMetric[];
}

export interface ForecastPoint {
  date: string;
  optimistic: number;
  neutral: number;
  pessimistic: number;
}

export interface ForecastResult {
  companyName: string;
  chartData: ForecastPoint[];
  analysis: string;
}

export enum AppState {
  LANDING,
  WORKSPACE,
  ACCOUNT,
  LOADING,
  DASHBOARD,
  MARKETS,
  PORTFOLIO,
  FORECASTING,
  ERROR,
  SIGN_IN,
  SIGN_UP
}
