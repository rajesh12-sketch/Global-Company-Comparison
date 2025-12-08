import React, { useState } from 'react';
import { AnalysisResult, FinancialMetric, NewsItem, Competitor } from '../types';
import { FinancialChart } from './Charts';
import { ArrowTrendingUp, ArrowTrendingDown, DocumentTextIcon, GlobeIcon, BoltIcon, ArrowPathIcon, ArrowDownTrayIcon, MinusIcon } from './Icons';

interface DashboardProps {
  data: AnalysisResult;
  onRefresh: () => void;
}

const MetricCard: React.FC<{ metric: FinancialMetric }> = ({ metric }) => {
  const isPositive = metric.trend === 'up';
  const isNeutral = metric.trend === 'neutral';
  
  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm hover:border-slate-600 transition-colors">
      <p className="text-slate-400 text-sm font-medium mb-1">{metric.label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
          isNeutral ? 'bg-slate-700 text-slate-300' :
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
    s: 'border-l-emerald-500',
    w: 'border-l-orange-500',
    o: 'border-l-blue-500',
    t: 'border-l-red-500'
  };

  return (
    <div className={`bg-slate-800 p-5 rounded-r-xl border-l-4 ${colors[type]} border-y border-r border-slate-700 h-full`}>
      <h4 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 flex items-start">
            <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-slate-500 flex-shrink-0"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const NewsCard: React.FC<{ news: NewsItem }> = ({ news }) => (
  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
        news.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
        news.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/30 text-slate-400'
      }`}>
        {news.sentiment}
      </span>
      <span className="text-xs text-slate-500">{news.source}</span>
    </div>
    <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">{news.title}</h4>
    <p className="text-xs text-slate-400 line-clamp-2">{news.summary}</p>
  </div>
);

const CompanyLogo = ({ website, ticker }: { website?: string, ticker: string }) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract domain from URL if present
  const domain = website ? website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : '';
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  if (!website || imageError || !domain) {
    return (
      <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-900/50 shrink-0">
        {ticker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className="w-14 h-14 rounded-xl bg-white shadow-lg shadow-indigo-900/50 shrink-0 overflow-hidden flex items-center justify-center">
       <img 
         src={logoUrl} 
         alt={`${ticker} logo`} 
         className="w-full h-full object-contain p-1"
         onError={() => setImageError(true)}
       />
    </div>
  );
};

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh }) => {
  const handleExport = () => {
    // Create a Blob from the JSON data
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.profile.name.replace(/\s+/g, '_')}_Analysis.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <CompanyLogo website={data.profile.website} ticker={data.profile.ticker} />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{data.profile.name}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="font-mono bg-slate-800 px-1.5 rounded text-slate-300">{data.profile.ticker}</span>
                <span>•</span>
                <span>{data.profile.sector}</span>
                <span>•</span>
                <span>{data.profile.headquarters}</span>
                {data.profile.website && (
                  <>
                    <span>•</span>
                    <a href={data.profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                      {new URL(data.profile.website.startsWith('http') ? data.profile.website : `https://${data.profile.website}`).hostname}
                    </a>
                  </>
                )}
              </div>
              {/* Added Description */}
              <p className="text-slate-300 text-sm mt-3 font-light leading-snug max-w-3xl border-l-2 border-slate-700 pl-3">
                {data.profile.description}
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mt-4 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Executive Outlook:</span>
            {data.executiveSummary}
          </p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export JSON
            </button>
            <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh Data
            </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-indigo-400" />
              Price Action
            </h3>
            <span className="text-xs text-slate-500">12 Month Projection</span>
          </div>
          <FinancialChart data={data.chartData} type="stock" />
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
              Financial Performance
            </h3>
            <span className="text-xs text-slate-500">Revenue vs Net Income</span>
          </div>
          <FinancialChart data={data.chartData} type="revenue" />
        </div>
      </div>

      {/* SWOT Analysis */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <GlobeIcon className="w-6 h-6 text-slate-400" />
            Strategic Analysis (SWOT)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SWOTCard title="Strengths" items={data.swot.strengths} type="s" />
            <SWOTCard title="Weaknesses" items={data.swot.weaknesses} type="w" />
            <SWOTCard title="Opportunities" items={data.swot.opportunities} type="o" />
            <SWOTCard title="Threats" items={data.swot.threats} type="t" />
        </div>
      </div>

      {/* Bottom Grid: News & Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white">Market Intelligence & News</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.recentNews.map((news, i) => <NewsCard key={i} news={news} />)}
            </div>
            {/* Sources Display */}
            {data.sourceUrls && data.sourceUrls.length > 0 && (
                <div className="mt-4 p-4 bg-slate-900 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Sources (Search Grounding)</p>
                    <div className="flex flex-wrap gap-2">
                        {data.sourceUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline truncate max-w-[200px] block bg-slate-800 px-2 py-1 rounded">
                                {getHostname(url)}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Competitors */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-lg font-semibold text-white">Competitive Landscape</h3>
            </div>
            <div className="divide-y divide-slate-700">
                {data.competitors.map((comp, i) => (
                    <div key={i} className="p-4 hover:bg-slate-700/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-200">{comp.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{comp.marketShare} Share</span>
                                {comp.marketShareTrend === 'up' && (
                                    <div className="bg-emerald-500/10 p-0.5 rounded" title="Market share increasing">
                                        <ArrowTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                )}
                                {comp.marketShareTrend === 'down' && (
                                    <div className="bg-red-500/10 p-0.5 rounded" title="Market share decreasing">
                                        <ArrowTrendingDown className="w-3.5 h-3.5 text-red-400" />
                                    </div>
                                )}
                                {comp.marketShareTrend === 'stable' && (
                                    <div className="bg-slate-600/20 p-0.5 rounded" title="Market share stable">
                                        <MinusIcon className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{comp.advantage}</p>
                        
                        {/* New Competitor Fields */}
                        <div className="flex flex-wrap gap-2">
                            {comp.recentFunding && (
                                <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/50">
                                    Funding: {comp.recentFunding}
                                </span>
                            )}
                            {comp.lastEarningsReport && (
                                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/50">
                                    Earnings: {comp.lastEarningsReport}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};