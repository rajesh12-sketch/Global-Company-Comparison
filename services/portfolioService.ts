import { PortfolioItem } from "../types.ts";

const PORTFOLIO_KEY = 'global_comp_portfolio';

export const portfolioService = {
  getPortfolio(): PortfolioItem[] {
    try {
      const data = localStorage.getItem(PORTFOLIO_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      
      // Filter out any potential null/undefined or corrupted entries
      return parsed.filter((item): item is PortfolioItem => 
        item !== null && 
        typeof item === 'object' && 
        'ticker' in item && 
        typeof item.ticker === 'string' &&
        'name' in item &&
        typeof item.name === 'string'
      );
    } catch (e) {
      console.error("Failed to parse portfolio", e);
      return [];
    }
  },

  addToPortfolio(item: PortfolioItem): PortfolioItem[] {
    if (!item || !item.ticker) return this.getPortfolio();
    
    const items = this.getPortfolio();
    if (!items.find(i => i.ticker === item.ticker)) {
      items.push(item);
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
    }
    return items;
  },

  removeFromPortfolio(ticker: string): PortfolioItem[] {
    if (!ticker) return this.getPortfolio();
    
    const items = this.getPortfolio().filter(i => i.ticker !== ticker);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
    return items;
  },

  isInPortfolio(ticker: string | undefined): boolean {
    if (!ticker) return false;
    const items = this.getPortfolio();
    return items.some(i => i.ticker === ticker);
  }
};