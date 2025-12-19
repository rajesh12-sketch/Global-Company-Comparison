
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, FinancialMetric, NewsItem, Competitor, PortfolioItem } from '../types';
import { FinancialChart, Sparkline, SWOTRadarChart } from './Charts';
import { portfolioService } from '../services/portfolioService';
import { 
  ArrowTrendingUp, ArrowTrendingDown, DocumentTextIcon, GlobeIcon, BoltIcon, 
  ArrowPathIcon, ArrowDownTrayIcon, MinusIcon, ChartBarIcon, ScaleIcon, 
  PencilSquareIcon, XMarkIcon, BuildingLibraryIcon, HandThumbUpIcon, 
  HandThumbDownIcon, ChevronDownIcon 
} from './Icons';

interface DashboardProps {
  data: AnalysisResult;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshError: string | null;
}

const MetricCard: React.FC<{ metric: FinancialMetric }> = ({ metric }) => {
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
    <div className={`p-5 rounded-2xl border border-slate-800 border-l-4 ${colors[type].split(' ')[2]} bg-slate-900/40 h-full`}>
      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${colors[type].split(' ')[1]}`}>{title}</h4>
      <ul className="space-y-3">
        {items && items.length > 0 ? items.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 flex items-start leading-relaxed">
            <span className="mr-3 mt-1.5 w-1 h-1 rounded-full bg-slate-700 flex-shrink-0"></span>
            {item}
          </li>
        )) : (
            <li className="text-sm text-slate-600 italic">Analysis unavailable for this quadrant</li>
        )}
      </ul>
    </div>
  );
};

const NewsCard: React.FC<{ news: NewsItem }> = ({ news }) => (
  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900 transition-all">
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

const CompanyLogo = ({ website, ticker }: { website?: string, ticker: string }) => {
  const [imageError, setImageError] = useState(false);
  const domain = website ? website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : '';
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  if (!website || imageError || !domain) {
    return (
      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shrink-0 uppercase">
        {ticker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white shadow-xl shrink-0 overflow-hidden flex items-center justify-center border border-slate-800">
       <img src={logoUrl} alt={ticker} className="w-full h-full object-contain p-2" onError={() => setImageError(true)} />
    </div>
  );
};

const getHostname = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; }
};

const NotesSection = ({ ticker }: { ticker: string }) => {
  const [note, setNote] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem(`global_comp_notes_${ticker}`);
    setNote(saved || '');
  }, [ticker]);

  const handleSave = () => localStorage.setItem(`global_comp_notes_${ticker}`, note);

  return (
    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 mt-8">
       <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
         <PencilSquareIcon className="w-4 h-4 text-primary-400" /> Private Intelligence
       </h3>
       <textarea 
         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-primary-500 h-32 resize-none transition-all placeholder:text-slate-700"
         placeholder="Notes on strategic implications, entry points, etc..."
         value={note}
         onChange={(e) => setNote(e.target.value)}
         onBlur={handleSave} 
       />
       <p className="text-[10px] text-slate-600 mt-3 italic text-right">Auto-saved to local session</p>
    </div>
  );
}

const ProfileModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: AnalysisResult }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <div className="flex items-center gap-4">
               <CompanyLogo website={data.profile.website} ticker={data.profile.ticker} />
               <div>
                  <h2 className="text-xl font-black text-white">{data.profile.name}</h2>
                  <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Full Corporate Dossier</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
               <XMarkIcon className="w-6 h-6" />
            </button>
         </div>
         <div className="p-6 space-y-4">
            {[
              { l: "CEO", v: data.profile.ceo },
              { l: "Founded", v: data.profile.founded },
              { l: "HQ", v: data.profile.headquarters },
              { l: "Sector", v: data.profile.sector },
              { l: "URL", v: data.profile.website }
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-800/50 last:border-0">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{row.l}</span>
                <span className="text-sm font-bold text-white text-right">{row.v || 'N/A'}</span>
              </div>
            ))}
            <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
               <h4 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Company Mission</h4>
               <p className="text-sm text-slate-400 leading-relaxed italic">"{data.profile.description}"</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const ComparisonModal = ({ isOpen, onClose, currentData }: { isOpen: boolean, onClose: () => void, currentData: AnalysisResult }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setPortfolioItems(portfolioService.getPortfolio().filter(p => p.ticker !== currentData.profile.ticker));
      setSelectedTickers([]);
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const companiesToCompare = [
    { name: currentData.profile.name, metrics: currentData.metrics, ticker: currentData.profile.ticker, isCurrent: true },
    ...selectedTickers.map(t => {
      const item = portfolioItems.find(p => p.ticker === t);
      return { name: item?.name || t, metrics: item?.metrics || [], ticker: item?.ticker, isCurrent: false };
    })
  ];

  const metricLabels = Array.from(new Set([...currentData.metrics.map(m => m.label)]));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
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
                {portfolioItems.map(item => (
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
                           const m = c.metrics?.find(x => x.label === label);
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
  const [inPortfolio, setInPortfolio] = useState(portfolioService.isInPortfolio(data.profile.ticker));
  const [showCompare, setShowCompare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type: 'json' | 'csv' | 'pdf') => {
    if (type === 'pdf') window.print();
    else if (type === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${data.profile.ticker}_report.json`; link.click(); URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  const togglePortfolio = () => {
    if (inPortfolio) portfolioService.removeFromPortfolio(data.profile.ticker);
    else portfolioService.addToPortfolio({ ticker: data.profile.ticker, name: data.profile.name, sector: data.profile.sector, price: data.metrics[0]?.value || 'N/A', change: data.metrics[0]?.change || 0, addedAt: new Date().toISOString(), metrics: data.metrics });
    setInPortfolio(!inPortfolio);
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-24 animate-fade-in relative">
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} data={data} />
      <ComparisonModal isOpen={showCompare} onClose={() => setShowCompare(false)} currentData={data} />

      {/* Local Error Notification */}
      {refreshError && (
        <div className="sticky top-4 z-[55] animate-fade-in mb-6">
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20">
             <div className="flex items-center gap-3">
                <XMarkIcon className="w-5 h-5" />
                <span className="text-sm font-bold tracking-tight">Intelligence update interrupted: {refreshError}</span>
             </div>
             <button 
               onClick={onRefresh} 
               className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
             >
                Retry Update
             </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between border-b border-slate-800 pb-10">
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-start">
          <CompanyLogo website={data.profile.website} ticker={data.profile.ticker} />
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">{data.profile.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-primary-400">{data.profile.ticker}</span>
              <span className="text-slate-700">•</span>
              <span>{data.profile.sector}</span>
              <span className="text-slate-700">•</span>
              <button onClick={() => setShowProfile(true)} className="text-indigo-400 hover:text-white transition-colors underline decoration-indigo-400/30 underline-offset-4">Identity File</button>
            </div>
            <div className="mt-6 p-5 bg-slate-900/40 rounded-2xl border border-slate-800 border-l-primary-500 border-l-4">
               <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] block mb-2">Executive Summary</span>
               <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">{data.executiveSummary}</p>
            </div>
          </div>
        </div>

        {/* Action Hub */}
        <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
          <button onClick={() => setShowCompare(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-sm font-bold text-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
            <ScaleIcon className="w-5 h-5" /> Compare
          </button>
          <button onClick={togglePortfolio} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border text-sm font-bold transition-all ${inPortfolio ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-primary-500/50'}`}>
            <ChartBarIcon className="w-5 h-5" /> {inPortfolio ? 'Saved' : 'Watch'}
          </button>
          <div className="relative group" ref={exportMenuRef}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-sm font-bold hover:border-slate-600 transition-all">
              <ArrowDownTrayIcon className="w-5 h-5" /> Export <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in ring-1 ring-white/5">
                <button onClick={() => handleExport('json')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800 tracking-widest">Raw Data (JSON)</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800 tracking-widest">Sheet Format (CSV)</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left p-4 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white tracking-widest">Full Report (PDF)</button>
              </div>
            )}
          </div>
          <button 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-primary-500/50 rounded-2xl text-sm font-bold text-slate-400 transition-all disabled:opacity-50`}
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {data.metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { t: "Market Dynamics", st: "Price projection (12M)", icon: <BoltIcon className="w-5 h-5 text-indigo-400" />, type: "stock" },
          { t: "Operational Performance", st: "Revenue vs Net (M)", icon: <DocumentTextIcon className="w-5 h-5 text-emerald-400" />, type: "revenue" }
        ].map((chart, i) => (
          <div key={i} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-lg font-black text-white flex items-center gap-3">{chart.icon} {chart.t}</h3>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{chart.st}</p>
                </div>
             </div>
             <FinancialChart data={data.chartData} type={chart.type as any} />
          </div>
        ))}
      </div>

      {/* SWOT & Competitors */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <h3 className="text-xl font-black text-white flex items-center gap-4">
             <GlobeIcon className="w-6 h-6 text-primary-400" /> Strategic Analysis Dossier
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SWOTCard title="Strengths" items={data.swot.strengths} type="s" />
              <SWOTCard title="Weaknesses" items={data.swot.weaknesses} type="w" />
              <SWOTCard title="Opportunities" items={data.swot.opportunities} type="o" />
              <SWOTCard title="Threats" items={data.swot.threats} type="t" />
           </div>
           <NotesSection ticker={data.profile.ticker} />
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-black text-white px-2">Market Sentiment</h3>
           <div className="space-y-4">
              {data.recentNews.map((n, i) => <NewsCard key={i} news={n} />)}
           </div>
           
           {data.sourceUrls && data.sourceUrls.length > 0 && (
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Grounding Sources</h4>
                <div className="flex flex-wrap gap-2">
                   {data.sourceUrls.map((url, i) => (
                     <a key={i} href={url} target="_blank" rel="noopener" className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:border-primary-500/50 transition-all truncate max-w-full">
                       {getHostname(url)}
                     </a>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
