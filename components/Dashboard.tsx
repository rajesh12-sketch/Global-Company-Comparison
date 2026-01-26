
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, FinancialMetric, NewsItem, Competitor, PortfolioItem } from '../types.ts';
import { FinancialChart, SWOTRadarChart } from './Charts.tsx';
import { portfolioService } from '../services/portfolioService.ts';
import { 
  ArrowTrendingUp, ArrowTrendingDown, DocumentTextIcon, GlobeIcon, BoltIcon, 
  ArrowPathIcon, ArrowDownTrayIcon, ChartBarIcon, ScaleIcon, 
  PencilSquareIcon, XMarkIcon, ChevronDownIcon 
} from './Icons.tsx';

interface DashboardProps {
  data: AnalysisResult;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshError: string | null;
}

const MetricCard: React.FC<{ metric: FinancialMetric }> = ({ metric }) => {
  if (!metric) return null;
  const isPositive = metric.trend === 'up';
  const isNeutral = metric.trend === 'neutral';
  
  return (
    <div className="bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all group">
      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2 group-hover:text-slate-400">{metric.label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">{metric.value}</h3>
        <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-lg ${
          isNeutral ? 'bg-slate-800 text-slate-400' :
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? <ArrowTrendingUp className="w-3 h-3 mr-1" /> : isNeutral ? null : <ArrowTrendingDown className="w-3 h-3 mr-1" />}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </div>
      </div>
    </div>
  );
};

const SWOTCard = ({ title, items, type }: { title: string, items: string[], type: 's'|'w'|'o'|'t' }) => {
  const colors = {
    s: 'bg-emerald-500/10 text-emerald-400 border-l-emerald-500',
    w: 'bg-orange-500/10 text-orange-400 border-l-orange-500',
    o: 'bg-blue-500/10 text-blue-400 border-l-blue-500',
    t: 'bg-red-500/10 text-red-400 border-l-red-500'
  };

  return (
    <div className={`p-5 rounded-2xl border border-slate-800 border-l-4 ${colors[type].split(' ')[2]} bg-slate-900/40 h-full shadow-lg`}>
      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${colors[type].split(' ')[1]}`}>{title}</h4>
      <ul className="space-y-3">
        {items && items.length > 0 ? items.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 flex items-start leading-relaxed">
            <span className="mr-3 mt-1.5 w-1 h-1 rounded-full bg-slate-700 flex-shrink-0"></span>
            {item}
          </li>
        )) : (
            <li className="text-sm text-slate-600 italic">Dossier unavailable for this quadrant</li>
        )}
      </ul>
    </div>
  );
};

const NewsCard: React.FC<{ news: NewsItem }> = ({ news }) => {
  if (!news) return null;
  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900 transition-all group">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
          news.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          news.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {news.sentiment}
        </span>
        <span className="text-[10px] font-bold text-slate-500">{news.source}</span>
      </div>
      <h4 className="text-sm font-bold text-slate-100 mb-2 leading-tight group-hover:text-primary-400 transition-colors">{news.title}</h4>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{news.summary}</p>
    </div>
  );
}

const CompanyLogo = ({ website, ticker }: { website?: string, ticker: string }) => {
  const [imageError, setImageError] = useState(false);
  
  const getDomain = (url: string) => {
    try {
      const cleanUrl = url.trim().toLowerCase().startsWith('http') ? url : `https://${url}`;
      const domain = new URL(cleanUrl).hostname.replace(/^www\./, '');
      return domain;
    } catch (e) { return null; }
  };

  const domain = website ? getDomain(website) : null;
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

  if (!logoUrl || imageError) {
    return (
      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shrink-0 uppercase border border-white/10">
        {ticker ? ticker.substring(0, 2) : '??'}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white shadow-xl shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 p-2">
       <img 
         src={logoUrl} 
         alt={ticker} 
         className="w-full h-full object-contain" 
         onError={() => setImageError(true)} 
       />
    </div>
  );
};

const getHostname = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; }
};

const NotesSection = ({ ticker }: { ticker: string }) => {
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!ticker) return;
    const saved = localStorage.getItem(`global_comp_notes_${ticker}`);
    setNote(saved || '');
  }, [ticker]);

  const handleSave = () => {
    if (!ticker) return;
    localStorage.setItem(`global_comp_notes_${ticker}`, note);
  }

  return (
    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 mt-8">
       <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
         <PencilSquareIcon className="w-4 h-4 text-primary-400" /> Private Intelligence
       </h3>
       <textarea 
         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-primary-500 h-32 resize-none transition-all placeholder:text-slate-700"
         placeholder="Notes on strategic implications, entry points, valuation targets..."
         value={note}
         onChange={(e) => setNote(e.target.value)}
         onBlur={handleSave} 
       />
       <p className="text-[10px] text-slate-600 mt-3 italic text-right">Encrypted session log</p>
    </div>
  );
}

const ProfileModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: AnalysisResult }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <div className="flex items-center gap-4">
               <CompanyLogo website={data.profile?.website} ticker={data.profile?.ticker || '??'} />
               <div>
                  <h2 className="text-xl font-black text-white">{data.profile?.name || 'Company Identity'}</h2>
                  <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Full Corporate Dossier</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
               <XMarkIcon className="w-6 h-6" />
            </button>
         </div>
         <div className="p-6 space-y-4">
            {[
              { l: "CEO", v: data.profile?.ceo },
              { l: "Founded", v: data.profile?.founded },
              { l: "HQ", v: data.profile?.headquarters },
              { l: "Sector", v: data.profile?.sector },
              { l: "URL", v: data.profile?.website }
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-800/50 last:border-0">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{row.l}</span>
                <span className="text-sm font-bold text-white text-right truncate max-w-[200px]">{row.v || 'N/A'}</span>
              </div>
            ))}
            <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
               <h4 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Company Mission</h4>
               <p className="text-sm text-slate-400 leading-relaxed italic">"{data.profile?.description || 'No description available.'}"</p>
            </div>
         </div>
         <div className="p-6 pt-0">
            <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Close Dossier</button>
         </div>
      </div>
    </div>
  );
};

const ComparisonModal = ({ isOpen, onClose, currentData }: { isOpen: boolean, onClose: () => void, currentData: AnalysisResult }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen && currentData?.profile?.ticker) {
      setPortfolioItems(portfolioService.getPortfolio().filter(p => p && p.ticker !== currentData.profile.ticker));
      setSelectedTickers([]);
    }
  }, [isOpen, currentData]);

  if (!isOpen || !currentData) return null;

  const companiesToCompare = [
    { 
      name: currentData.profile?.name || 'Current', 
      metrics: currentData.metrics || [], 
      ticker: currentData.profile?.ticker || 'CURR', 
      isCurrent: true 
    },
    ...selectedTickers.map(t => {
      const item = portfolioItems.find(p => p && p.ticker === t);
      return { 
        name: item?.name || t, 
        metrics: item?.metrics || [], 
        ticker: item?.ticker || t, 
        isCurrent: false 
      };
    })
  ];

  const metricLabels = Array.from(new Set([...(currentData.metrics || []).map(m => m?.label)]));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <ScaleIcon className="w-6 h-6 text-primary-400" /> Peer Comparison
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Benchmark against portfolio leaders</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           <div className="w-full md:w-72 bg-slate-950 p-4 border-b md:border-r border-slate-800 overflow-y-auto">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Select Peers (Max 3)</h3>
              <div className="space-y-2">
                {portfolioItems.map(item => item && (
                  <label key={item.ticker} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedTickers.includes(item.ticker) ? 'bg-primary-500/10 border-primary-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                    <input type="checkbox" checked={selectedTickers.includes(item.ticker)} onChange={() => selectedTickers.includes(item.ticker) ? setSelectedTickers(selectedTickers.filter(t => t !== item.ticker)) : selectedTickers.length < 3 && setSelectedTickers([...selectedTickers, item.ticker])} className="rounded-md border-slate-700 text-primary-500 bg-slate-950" />
                    <div className="overflow-hidden">
                      <div className="font-bold text-white text-sm">{item.ticker}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.name}</div>
                    </div>
                  </label>
                ))}
              </div>
           </div>
           <div className="flex-1 p-4 md:p-8 overflow-auto">
              <div className="min-w-full overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950">
                      <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-40">Metric</th>
                      {companiesToCompare.map((c, idx) => (
                        <th key={idx} className={`p-5 min-w-[140px] border-l border-slate-800 ${c.isCurrent ? 'bg-primary-500/5' : ''}`}>
                           <div className="font-black text-white text-base">{c.ticker}</div>
                           <div className="text-[10px] text-slate-500 truncate">{c.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {metricLabels.map((label, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-5 text-xs font-bold text-slate-400">{label}</td>
                        {companiesToCompare.map((c, j) => {
                           const m = c.metrics?.find(x => x && x.label === label);
                           return (
                             <td key={j} className={`p-5 border-l border-slate-800 ${c.isCurrent ? 'bg-primary-500/5' : ''}`}>
                                {m ? (
                                  <div>
                                    <div className="text-white font-black text-sm">{m.value}</div>
                                    <div className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-emerald-400' : m.trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                                      {m.change > 0 ? '+' : ''}{m.change}%
                                    </div>
                                  </div>
                                ) : <span className="text-slate-700 italic text-[10px]">--</span>}
                             </td>
                           );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh, isRefreshing, refreshError }) => {
  const [inPortfolio, setInPortfolio] = useState(portfolioService.isInPortfolio(data?.profile?.ticker || ''));
  const [showCompare, setShowCompare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const togglePortfolio = () => {
    if (!data?.profile?.ticker) return;

    if (inPortfolio) {
      portfolioService.removeFromPortfolio(data.profile.ticker);
      setInPortfolio(false);
    } else {
      const priceMetric = data.metrics?.find(m => 
        m.label?.toLowerCase().includes('price') || 
        m.label?.toLowerCase().includes('stock')
      ) || data.metrics?.[0];

      const newItem: PortfolioItem = {
        ticker: data.profile.ticker,
        name: data.profile.name,
        sector: data.profile.sector,
        price: priceMetric?.value || "N/A",
        change: priceMetric?.change || 0,
        addedAt: new Date().toISOString(),
        metrics: data.metrics
      };
      portfolioService.addToPortfolio(newItem);
      setInPortfolio(true);
    }
  };

  useEffect(() => {
    if (data?.profile?.ticker) {
      setInPortfolio(portfolioService.isInPortfolio(data.profile.ticker));
    }
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!data) return null;

  const handleExport = (type: 'json' | 'csv' | 'pdf' | 'swot') => {
    if (type === 'pdf') {
      window.print();
    } else if (type === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${data.profile?.ticker || 'analysis'}_report.json`; link.click(); URL.revokeObjectURL(url);
    } else if (type === 'csv') {
      const headers = "Metric,Value,Change,Trend\n";
      const rows = data.metrics?.map(m => `${m.label},${m.value},${m.change},${m.trend}`).join('\n') || "";
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${data.profile?.ticker || 'metrics'}.csv`; link.click(); URL.revokeObjectURL(url);
    } else if (type === 'swot') {
      const swotText = `
SWOT Analysis Briefing: ${data.profile?.name} (${data.profile?.ticker})
Export Date: ${new Date().toLocaleString()}

STRENGTHS:
${data.swot?.strengths?.map(s => `[+] ${s}`).join('\n') || 'N/A'}

WEAKNESSES:
${data.swot?.weaknesses?.map(w => `[-] ${w}`).join('\n') || 'N/A'}

OPPORTUNITIES:
${data.swot?.opportunities?.map(o => `[*] ${o}`).join('\n') || 'N/A'}

THREATS:
${data.swot?.threats?.map(t => `[!] ${t}`).join('\n') || 'N/A'}
`.trim();
      const blob = new Blob([swotText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${data.profile?.ticker || 'swot'}_analysis.txt`; link.click(); URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  const swotRadarData = [
    { subject: 'Strengths', A: data.swot?.strengths?.length || 0, fullMark: 10 },
    { subject: 'Weaknesses', A: data.swot?.weaknesses?.length || 0, fullMark: 10 },
    { subject: 'Opportunities', A: data.swot?.opportunities?.length || 0, fullMark: 10 },
    { subject: 'Threats', A: data.swot?.threats?.length || 0, fullMark: 10 },
  ];

  return (
    <>
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} data={data} />
      <ComparisonModal isOpen={showCompare} onClose={() => setShowCompare(false)} currentData={data} />

      <div className="space-y-6 md:space-y-10 pb-24 animate-fade-in relative">
        {/* Prominent Overlay Error Banner */}
        {refreshError && (
          <div className="sticky top-4 z-[55] animate-fade-in mb-8">
            <div className="bg-red-600 text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_60px_rgba(220,38,38,0.4)] flex flex-col sm:flex-row items-center justify-between border border-white/30 backdrop-blur-xl">
               <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="p-3 bg-white/20 rounded-2xl">
                      <XMarkIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="font-black uppercase tracking-[0.2em] text-[10px] opacity-80 mb-0.5">Critical Feed Interruption</h4>
                      <p className="text-sm font-bold tracking-tight">{refreshError}</p>
                  </div>
               </div>
               <button 
                  onClick={onRefresh} 
                  className="bg-white text-red-600 hover:bg-red-50 px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
               >
                  Restart Data Sync
               </button>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between border-b border-slate-800 pb-10">
          <div className="flex-1 flex flex-col md:flex-row gap-6 items-start">
            <CompanyLogo website={data.profile?.website} ticker={data.profile?.ticker || '??'} />
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">{data.profile?.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">
                <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-primary-400">{data.profile?.ticker}</span>
                <span className="text-slate-700">•</span>
                <span>{data.profile?.sector}</span>
                <span className="text-slate-700">•</span>
                <button 
                  onClick={() => setShowProfile(true)} 
                  className="px-3 py-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-white rounded-lg transition-all border border-indigo-500/20 font-black uppercase text-[10px] tracking-widest"
                >
                  Identity File
                </button>
              </div>
              <div className="mt-6 p-5 bg-slate-900/40 rounded-2xl border border-slate-800 border-l-primary-500 border-l-4">
                 <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] block mb-2">Executive Briefing</span>
                 <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">{data.executiveSummary}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
            <button onClick={() => setShowCompare(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-sm font-bold text-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95">
              <ScaleIcon className="w-5 h-5" /> Compare
            </button>
            <button onClick={togglePortfolio} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 ${inPortfolio ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-primary-500/50'}`}>
              <ChartBarIcon className="w-5 h-5" /> {inPortfolio ? 'Saved' : 'Watch'}
            </button>
            <div className="relative group" ref={exportMenuRef}>
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-sm font-bold hover:border-slate-600 transition-all active:scale-95">
                <ArrowDownTrayIcon className="w-5 h-5" /> Export <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in ring-1 ring-white/5">
                  <button onClick={() => handleExport('json')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800 tracking-widest">Full Dossier (JSON)</button>
                  <button onClick={() => handleExport('csv')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800 tracking-widest">Fiscal Data (CSV)</button>
                  <button onClick={() => handleExport('swot')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800 tracking-widest">SWOT Text (TXT)</button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white tracking-widest">Print / PDF Report</button>
                </div>
              )}
            </div>
            <button 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className={`flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-primary-500/50 rounded-2xl text-sm font-bold text-slate-400 transition-all active:scale-95 disabled:opacity-50`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {(data.metrics || []).map((m, i) => <MetricCard key={i} metric={m} />)}
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { t: "Market Dynamics", st: "Price projection timeline", icon: <BoltIcon className="w-5 h-5 text-indigo-400" />, type: "stock" },
            { t: "Performance Matrix", st: "Revenue vs Net Income (M)", icon: <DocumentTextIcon className="w-5 h-5 text-emerald-400" />, type: "revenue" }
          ].map((chart, i) => (
            <div key={i} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl min-h-[400px]">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-lg font-black text-white flex items-center gap-3">{chart.icon} {chart.t}</h3>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{chart.st}</p>
                  </div>
               </div>
               <div className="h-[288px] w-full">
                  <FinancialChart data={data.chartData || []} type={chart.type as any} />
               </div>
            </div>
          ))}
        </div>

        {/* SWOT & Competitors */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <h3 className="text-xl font-black text-white flex items-center gap-4">
                   <GlobeIcon className="w-6 h-6 text-primary-400" /> Tactical Intelligence SWOT
                 </h3>
                 <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 w-full md:w-72 shadow-inner">
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] text-center mb-2">Dossier Balance Radar</h4>
                    <div className="h-64 w-full">
                      <SWOTRadarChart data={swotRadarData} />
                    </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SWOTCard title="Strengths" items={data.swot?.strengths || []} type="s" />
                <SWOTCard title="Weaknesses" items={data.swot?.weaknesses || []} type="w" />
                <SWOTCard title="Opportunities" items={data.swot?.opportunities || []} type="o" />
                <SWOTCard title="Threats" items={data.swot?.threats || []} type="t" />
             </div>
             {data.profile?.ticker && <NotesSection ticker={data.profile.ticker} />}
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-black text-white px-2">Market Pulse</h3>
             <div className="space-y-4">
                {(data.recentNews || []).slice(0, 5).map((n, i) => <NewsCard key={i} news={n} />)}
             </div>
             
             {data.sourceUrls && data.sourceUrls.length > 0 && (
               <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Intelligence Sources</h4>
                  <div className="flex flex-wrap gap-2">
                     {data.sourceUrls.map((url, i) => url && (
                       <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:border-primary-500/50 transition-all truncate max-w-full">
                         {getHostname(url)}
                       </a>
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
};
