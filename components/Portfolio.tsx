import React, { useEffect, useState } from 'react';
import { PortfolioItem } from '../types';
import { portfolioService } from '../services/portfolioService';
import { ChartBarIcon, ArrowTrendingUp, ArrowTrendingDown, BoltIcon } from './Icons';

interface PortfolioProps {
  onSelectCompany: (ticker: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onSelectCompany }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    setItems(portfolioService.getPortfolio());
  }, []);

  const handleRemove = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    setItems(portfolioService.removeFromPortfolio(ticker));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
          <ChartBarIcon className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Portfolio is Empty</h2>
        <p className="text-slate-400 max-w-sm mb-6">
          Search for companies in the Dashboard and click "Save to Portfolio" to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Portfolio</h1>
        <p className="text-slate-400 mt-2">Track your saved companies and quick-access their latest analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div 
            key={item.ticker}
            onClick={() => onSelectCompany(item.name)}
            className="group bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-primary-500/50 hover:bg-slate-800/80 transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleRemove(e, item.ticker)}
                  className="text-xs text-red-400 hover:text-red-300 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm"
                >
                    Remove
                </button>
             </div>

             <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">{item.ticker}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change >= 0 ? <ArrowTrendingUp className="w-4 h-4" /> : <ArrowTrendingDown className="w-4 h-4" />}
                    {Math.abs(item.change)}%
                </div>
             </div>
             
             <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Last Price</p>
                    <p className="text-2xl font-semibold text-white">{item.price}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">{item.sector}</p>
                    <p className="text-[10px] text-slate-600 mt-1">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center text-primary-400 text-xs font-medium group-hover:translate-x-1 transition-transform">
                View Analysis <BoltIcon className="w-3 h-3 ml-1" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};