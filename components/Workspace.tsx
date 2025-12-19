
import React, { useEffect, useState } from 'react';
import { User, PortfolioItem } from '../types.ts';
import { portfolioService } from '../services/portfolioService.ts';
import { BoltIcon, ChartBarIcon, GlobeIcon, Squares2X2Icon, ArrowTrendingUp, ArrowTrendingDown } from './Icons.tsx';

interface WorkspaceProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ user, onNavigate }) => {
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioItem[]>([]);
  
  const marketPulse = [
    { name: 'S&P 500', value: '5,234.1', change: 1.2, trend: 'up' },
    { name: 'NASDAQ', value: '16,428.5', change: 1.5, trend: 'up' },
    { name: 'DJIA', value: '39,120.8', change: 0.8, trend: 'up' },
    { name: 'DAX', value: '18,200.3', change: -0.4, trend: 'down' },
  ];

  useEffect(() => {
    setPortfolioSummary(portfolioService.getPortfolio().slice(0, 3));
  }, []);

  return (
    <div className="pb-20 animate-fade-in space-y-8 md:space-y-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            System Online, <span className="text-primary-500">{user?.name.split(' ')[0] || 'Analyst'}</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium tracking-tight uppercase tracking-widest opacity-60">Aggregate Global Market Intelligence</p>
        </div>
        <div className="text-left md:text-right">
            <p className="text-[10px] md:text-xs text-slate-500 uppercase font-black tracking-[0.2em]">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="flex items-center gap-2 mt-2 md:justify-end">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Feed active</span>
            </div>
        </div>
      </div>

      {/* Market Pulse - Horizontal Scroll on Mobile */}
      <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x">
         {marketPulse.map((m, i) => (
             <div key={i} className="min-w-[160px] md:min-w-0 flex-1 bg-slate-900/50 p-5 rounded-3xl border border-slate-800 snap-center">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">{m.name}</p>
                 <div className="flex justify-between items-end">
                     <span className="text-lg font-black text-white tracking-tight">{m.value}</span>
                     <span className={`text-[10px] font-bold flex items-center ${m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                         {m.trend === 'up' ? <ArrowTrendingUp className="w-3 h-3 mr-1" /> : <ArrowTrendingDown className="w-3 h-3 mr-1" />}
                         {Math.abs(m.change)}%
                     </span>
                 </div>
             </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                    <Squares2X2Icon className="w-6 h-6 text-primary-400" /> Tactical Ops
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => onNavigate('MARKETS')}
                    className="p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-primary-500/50 rounded-3xl text-left group transition-all"
                  >
                      <div className="bg-primary-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary-500/20">
                          <GlobeIcon className="w-6 h-6 text-primary-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-widest text-sm">Market Scanner</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">Global entity discovery by economic region.</p>
                  </button>

                  <button 
                    onClick={() => onNavigate('FORECASTING')}
                    className="p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-3xl text-left group transition-all"
                  >
                      <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20">
                          <BoltIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-widest text-sm">AI Predictor</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">Predictive scenario modeling & valuation.</p>
                  </button>

                  <button 
                    onClick={() => onNavigate('PORTFOLIO')}
                    className="p-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-3xl text-left group transition-all"
                  >
                      <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                          <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-widest text-sm">Asset Watch</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">Tracking active interests & peers.</p>
                  </button>
              </div>

              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8">
                 <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Macro Trends</h3>
                 <div className="space-y-6">
                     {[
                       { e: "🤖", t: "Semicap Sector Evolution", d: "Next-gen lithography impacting tech valuations.", c: "Tech" },
                       { e: "⚡", t: "Global Energy Transition Q4", d: "Renewable infrastructure deployment accelerating.", c: "Energy" }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-6 items-start group cursor-pointer">
                           <div className="w-16 h-16 bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl group-hover:bg-slate-700 transition-colors">{item.e}</div>
                           <div>
                               <h4 className="text-white font-bold group-hover:text-primary-400 transition-colors text-base md:text-lg">{item.t}</h4>
                               <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.d}</p>
                               <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-2 block">{item.c} Dossier</span>
                           </div>
                       </div>
                     ))}
                 </div>
              </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Watchlist</h2>
                    <button onClick={() => onNavigate('PORTFOLIO')} className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors">View Library</button>
                </div>
                
                {portfolioSummary.length === 0 ? (
                    <div className="text-center py-10">
                        <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Library is empty</p>
                        <button onClick={() => onNavigate('MARKETS')} className="mt-6 text-[10px] font-black uppercase bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all tracking-widest">Scan Markets</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {portfolioSummary.map(item => (
                            <div key={item.ticker} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer" onClick={() => onNavigate('PORTFOLIO')}>
                                <div>
                                    <div className="font-black text-white text-sm tracking-tight">{item.ticker}</div>
                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate max-w-[100px]">{item.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-200">{item.price}</div>
                                    <div className={`text-[10px] font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.change}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-slate-800 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Operational Status</h3>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Node Connectivity</span>
                        <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Nominal</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Core Engine</span>
                        <span className="text-slate-300">Gemini 3 Flash</span>
                    </div>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
