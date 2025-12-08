import React, { useEffect, useState } from 'react';
import { User, PortfolioItem } from '../types';
import { portfolioService } from '../services/portfolioService';
import { BoltIcon, ChartBarIcon, GlobeIcon, Squares2X2Icon, ArrowTrendingUp, ArrowTrendingDown } from './Icons';

interface WorkspaceProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ user, onNavigate }) => {
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioItem[]>([]);
  
  // Mock "Market Pulse" Data
  const marketPulse = [
    { name: 'S&P 500', value: '5,234.12', change: 1.2, trend: 'up' },
    { name: 'NASDAQ', value: '16,428.50', change: 1.5, trend: 'up' },
    { name: 'DJIA', value: '39,120.80', change: 0.8, trend: 'up' },
    { name: 'FTSE 100', value: '7,930.90', change: -0.2, trend: 'down' },
  ];

  useEffect(() => {
    // Get top 3 portfolio items
    const items = portfolioService.getPortfolio().slice(0, 3);
    setPortfolioSummary(items);
  }, []);

  return (
    <div className="pb-20 animate-fade-in space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0] || 'Analyst'}
          </h1>
          <p className="text-slate-400 mt-2">Here is your daily briefing and market overview.</p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Market Pulse Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {marketPulse.map((m, i) => (
             <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                 <p className="text-xs text-slate-500 font-bold uppercase">{m.name}</p>
                 <div className="flex justify-between items-end mt-2">
                     <span className="text-lg font-semibold text-white">{m.value}</span>
                     <span className={`text-xs flex items-center ${m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                         {m.trend === 'up' ? <ArrowTrendingUp className="w-3 h-3 mr-1" /> : <ArrowTrendingDown className="w-3 h-3 mr-1" />}
                         {Math.abs(m.change)}%
                     </span>
                 </div>
             </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Squares2X2Icon className="w-5 h-5 text-primary-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => onNavigate('MARKETS')}
                    className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-primary-500/50 rounded-xl text-left group transition-all"
                  >
                      <div className="bg-primary-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <GlobeIcon className="w-6 h-6 text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-white">Explore Markets</h3>
                      <p className="text-sm text-slate-500 mt-1">Browse global companies by region.</p>
                  </button>

                  <button 
                    onClick={() => onNavigate('FORECASTING')}
                    className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-yellow-500/50 rounded-xl text-left group transition-all"
                  >
                      <div className="bg-yellow-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <BoltIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="font-semibold text-white">Run Forecast</h3>
                      <p className="text-sm text-slate-500 mt-1">Generate AI price scenarios.</p>
                  </button>

                  <button 
                    onClick={() => onNavigate('PORTFOLIO')}
                    className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-left group transition-all"
                  >
                      <div className="bg-emerald-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-white">View Portfolio</h3>
                      <p className="text-sm text-slate-500 mt-1">Track your saved assets.</p>
                  </button>
              </div>

              {/* Recommended Reads (Static for Demo) */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                 <h3 className="text-lg font-semibold text-white mb-4">Analyst Picks & Insights</h3>
                 <div className="space-y-4">
                     <div className="flex gap-4 items-start pb-4 border-b border-slate-700/50">
                         <div className="w-16 h-16 bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">🤖</div>
                         <div>
                             <h4 className="text-white font-medium hover:text-primary-400 cursor-pointer">The Future of AI Hardware</h4>
                             <p className="text-sm text-slate-400 mt-1">An in-depth look at how next-gen chips are reshaping the tech sector valuation models.</p>
                             <span className="text-xs text-slate-500 mt-2 block">5 min read • Technology</span>
                         </div>
                     </div>
                     <div className="flex gap-4 items-start">
                         <div className="w-16 h-16 bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">⚡</div>
                         <div>
                             <h4 className="text-white font-medium hover:text-primary-400 cursor-pointer">Energy Transition Report Q3</h4>
                             <p className="text-sm text-slate-400 mt-1">Global shifts in renewable energy adoption and what it means for traditional oil majors.</p>
                             <span className="text-xs text-slate-500 mt-2 block">8 min read • Energy</span>
                         </div>
                     </div>
                 </div>
              </div>
          </div>

          {/* Portfolio Snapshot */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 h-fit">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Portfolio Snapshot</h2>
                  <button onClick={() => onNavigate('PORTFOLIO')} className="text-xs text-primary-400 hover:text-white transition-colors">View All</button>
              </div>
              
              {portfolioSummary.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                      <ChartBarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No companies tracked yet.</p>
                      <button onClick={() => onNavigate('MARKETS')} className="mt-4 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">Find Companies</button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {portfolioSummary.map(item => (
                          <div key={item.ticker} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => onNavigate('PORTFOLIO')}>
                              <div>
                                  <div className="font-semibold text-white text-sm">{item.ticker}</div>
                                  <div className="text-xs text-slate-500 truncate max-w-[100px]">{item.name}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-medium text-slate-200">{item.price}</div>
                                  <div className={`text-xs ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {item.change >= 0 ? '+' : ''}{item.change}%
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">System Status</h3>
                  <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500">API Connection</span>
                      <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Operational</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Model</span>
                      <span className="text-slate-300">Gemini 2.5 Flash</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};