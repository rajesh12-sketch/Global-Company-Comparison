import { PortfolioItem } from "../types";

const PORTFOLIO_KEY = 'global_comp_portfolio';

export const portfolioService = {
  getPortfolio(): PortfolioItem[] {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToPortfolio(item: PortfolioItem): PortfolioItem[] {
    const items = this.getPortfolio();
    if (!items.find(i => i.ticker === item.ticker)) {
      items.push(item);
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
    }
    return items;
  },

  removeFromPortfolio(ticker: string): PortfolioItem[] {
    const items = this.getPortfolio().filter(i => i.ticker !== ticker);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
    return items;
  },

  isInPortfolio(ticker: string): boolean {
    const items = this.getPortfolio();
    return items.some(i => i.ticker === ticker);
  }
};