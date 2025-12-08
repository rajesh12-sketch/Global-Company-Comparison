import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, FinancialMetric, NewsItem, Competitor, PortfolioItem } from '../types';
import { FinancialChart, Sparkline, SWOTRadarChart } from './Charts';
import { portfolioService } from '../services/portfolioService';
import { ArrowTrendingUp, ArrowTrendingDown, DocumentTextIcon, GlobeIcon, BoltIcon, ArrowPathIcon, ArrowDownTrayIcon, MinusIcon, ChartBarIcon, ScaleIcon, PencilSquareIcon, XMarkIcon, BuildingLibraryIcon, HandThumbUpIcon, HandThumbDownIcon, ChevronDownIcon } from './Icons';

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
        {items && items.length > 0 ? items.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-300 flex items-start">
            <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-slate-500 flex-shrink-0"></span>
            {item}
          </li>
        )) : (
            <li className="text-sm text-slate-500 italic">No data available</li>
        )}
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
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};

const NotesSection = ({ ticker }: { ticker: string }) => {
  const [note, setNote] = useState('');
  
  useEffect(() => {
    const saved = localStorage.getItem(`global_comp_notes_${ticker}`);
    if (saved) setNote(saved);
    else setNote('');
  }, [ticker]);

  const handleSave = () => {
    localStorage.setItem(`global_comp_notes_${ticker}`, note);
  };

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mt-6 relative group">
       <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
         <PencilSquareIcon className="w-5 h-5 text-slate-400" /> Private Notes
       </h3>
       <textarea 
         className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500 h-32 resize-none transition-colors"
         placeholder="Add your private analysis notes here..."
         value={note}
         onChange={(e) => setNote(e.target.value)}
         onBlur={handleSave} 
       />
       <p className="text-[10px] text-slate-500 mt-2 text-right italic opacity-0 group-hover:opacity-100 transition-opacity">Auto-saved to local storage</p>
    </div>
  );
}

const ProfileModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: AnalysisResult }) => {
  if (!isOpen) return null;

  const DetailRow = ({ label, value }: { label: string, value: string | undefined }) => (
    <div className="flex justify-between py-3 border-b border-slate-800 last:border-0">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-white font-semibold text-right">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <CompanyLogo website={data.profile.website} ticker={data.profile.ticker} />
               <div>
                  <div className="leading-tight">{data.profile.name}</div>
                  <div className="text-xs text-slate-400 font-normal">Full Corporate Profile</div>
               </div>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
               <XMarkIcon className="w-6 h-6" />
            </button>
         </div>
         <div className="p-6">
            <DetailRow label="CEO" value={data.profile.ceo} />
            <DetailRow label="Founded" value={data.profile.founded} />
            <DetailRow label="Headquarters" value={data.profile.headquarters} />
            <DetailRow label="Sector" value={data.profile.sector} />
            <DetailRow label="Website" value={data.profile.website} />
            <div className="mt-6">
               <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">About</h4>
               <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  {data.profile.description}
               </p>
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
      // Load portfolio items, excluding current company
      const items = portfolioService.getPortfolio().filter(p => p.ticker !== currentData.profile.ticker);
      setPortfolioItems(items);
      setSelectedTickers([]);
    }
  }, [isOpen, currentData]);

  const toggleSelection = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(selectedTickers.filter(t => t !== ticker));
    } else {
      if (selectedTickers.length < 3) {
        setSelectedTickers([...selectedTickers, ticker]);
      }
    }
  };

  if (!isOpen) return null;

  // Prepare comparison data
  const companiesToCompare = [
    { name: currentData.profile.name, metrics: currentData.metrics, ticker: currentData.profile.ticker, isCurrent: true },
    ...selectedTickers.map(t => {
      const item = portfolioItems.find(p => p.ticker === t);
      return { 
        name: item?.name || t, 
        metrics: item?.metrics || [], 
        ticker: item?.ticker,
        isCurrent: false
      };
    })
  ];

  // Extract all unique metric labels from current company to use as rows
  const metricLabels = currentData.metrics.map(m => m.label);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ScaleIcon className="w-6 h-6 text-indigo-400" /> Compare Companies
            </h2>
            <p className="text-slate-400 text-sm mt-1">Select up to 3 companies from your portfolio to compare.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           
           {/* Sidebar: Selection */}
           <div className="w-full md:w-64 bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Your Portfolio</h3>
              {portfolioItems.length === 0 ? (
                <p className="text-sm text-slate-600 italic">No other companies in portfolio.</p>
              ) : (
                <div className="space-y-2">
                  {portfolioItems.map(item => (
                    <label key={item.ticker} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTickers.includes(item.ticker) 
                        ? 'bg-primary-900/20 border-primary-500/50' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={selectedTickers.includes(item.ticker)}
                        onChange={() => toggleSelection(item.ticker)}
                        disabled={!selectedTickers.includes(item.ticker) && selectedTickers.length >= 3}
                        className="rounded border-slate-600 text-primary-500 focus:ring-offset-0 focus:ring-primary-500 bg-slate-800"
                      />
                      <div className="overflow-hidden">
                        <div className="font-medium text-slate-200 truncate text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.ticker}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
           </div>

           {/* Main: Table */}
           <div className="flex-1 p-6 overflow-auto">
              {companiesToCompare.length === 1 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <ScaleIcon className="w-16 h-16 mb-4 text-slate-700" />
                    <p>Select companies from the left to begin comparison.</p>
                 </div>
              ) : (
                <div className="min-w-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Metric</th>
                        {companiesToCompare.map((company, idx) => (
                          <th key={idx} className={`p-4 border-b border-slate-800 w-1/4 ${company.isCurrent ? 'bg-slate-800/50' : ''}`}>
                             <div className="font-bold text-white text-lg">{company.ticker}</div>
                             <div className="text-xs text-slate-400 truncate max-w-[150px]">{company.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {metricLabels.map((label, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-800/30">
                          <td className="p-4 text-sm font-medium text-slate-400">{label}</td>
                          {companiesToCompare.map((company, colIdx) => {
                             const metric = company.metrics?.find(m => m.label === label);
                             return (
                               <td key={colIdx} className={`p-4 ${company.isCurrent ? 'bg-slate-800/30' : ''}`}>
                                  {metric ? (
                                    <div>
                                      <div className="text-white font-semibold">{metric.value}</div>
                                      <div className={`text-xs ${metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                                        {metric.change > 0 ? '+' : ''}{metric.change}%
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 text-xs italic">N/A</span>
                                  )}
                               </td>
                             );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, onRefresh }) => {
  const [inPortfolio, setInPortfolio] = useState(portfolioService.isInPortfolio(data.profile.ticker));
  const [showCompare, setShowCompare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.profile.name.replace(/\s+/g, '_')}_Analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    const { profile, metrics, competitors, swot } = data;
    let csvContent = "data:text/csv;charset=utf-8,";

    // Section 1: Profile
    csvContent += "Company Profile\n";
    csvContent += `Name,${profile.name}\n`;
    csvContent += `Ticker,${profile.ticker}\n`;
    csvContent += `Sector,${profile.sector}\n`;
    csvContent += `CEO,${profile.ceo}\n`;
    csvContent += `Headquarters,${profile.headquarters}\n\n`;

    // Section 2: Financial Metrics
    csvContent += "Financial Metrics\n";
    csvContent += "Metric,Value,Change,Trend\n";
    metrics.forEach(m => {
        csvContent += `"${m.label}","${m.value}","${m.change}%","${m.trend}"\n`;
    });
    csvContent += "\n";

    // Section 3: SWOT
    csvContent += "SWOT Analysis\n";
    csvContent += "Type,Item\n";
    swot.strengths.forEach(i => csvContent += `Strength,"${i.replace(/"/g, '""')}"\n`);
    swot.weaknesses.forEach(i => csvContent += `Weakness,"${i.replace(/"/g, '""')}"\n`);
    swot.opportunities.forEach(i => csvContent += `Opportunity,"${i.replace(/"/g, '""')}"\n`);
    swot.threats.forEach(i => csvContent += `Threat,"${i.replace(/"/g, '""')}"\n`);
    csvContent += "\n";

    // Section 4: Competitors
    csvContent += "Competitors\n";
    csvContent += "Name,Market Share,Trend,Advantage\n";
    competitors.forEach(c => {
        csvContent += `"${c.name}","${c.marketShare}","${c.marketShareTrend}","${c.advantage.replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_Analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  const handleAddToPortfolio = () => {
    // Attempt to extract stock price change from metrics if available, or chart data
    const stockMetric = data.metrics?.find(m => m.label.toLowerCase().includes('stock') || m.label.toLowerCase().includes('price') || m.label.toLowerCase().includes('cap'));
    
    // Fallback data extraction
    const currentPrice = data.chartData && data.chartData.length > 0 ? `$${data.chartData[data.chartData.length - 1].stockPrice}` : 'N/A';
    
    const item: PortfolioItem = {
        ticker: data.profile.ticker,
        name: data.profile.name,
        sector: data.profile.sector,
        price: stockMetric?.value || currentPrice,
        change: stockMetric?.change || 0,
        addedAt: new Date().toISOString(),
        metrics: data.metrics // Save metrics for comparison
    };
    
    if (inPortfolio) {
        portfolioService.removeFromPortfolio(data.profile.ticker);
        setInPortfolio(false);
    } else {
        portfolioService.addToPortfolio(item);
        setInPortfolio(true);
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    console.log(`User feedback for ${data.profile.ticker}: ${type}`);
  };

  // Ensure safe data access
  const safeMetrics = data.metrics || [];
  const safeChartData = data.chartData || [];
  const safeRecentNews = data.recentNews || [];
  const safeCompetitors = data.competitors || [];
  const safeSwot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

  const swotChartData = [
    { subject: 'Strengths', A: safeSwot.strengths.length },
    { subject: 'Weaknesses', A: safeSwot.weaknesses.length },
    { subject: 'Opportunities', A: safeSwot.opportunities.length },
    { subject: 'Threats', A: safeSwot.threats.length },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      
      {/* Modals */}
      <ComparisonModal 
        isOpen={showCompare} 
        onClose={() => setShowCompare(false)} 
        currentData={data} 
      />
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        data={data}
      />

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
              </div>
              <button onClick={() => setShowProfile(true)} className="text-primary-400 hover:text-primary-300 text-xs mt-1 font-medium flex items-center gap-1">
                 View Full Profile <BuildingLibraryIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mt-4 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Executive Outlook:</span>
            {data.executiveSummary}
          </p>
          
          {/* Private Notes Section */}
          <NotesSection ticker={data.profile.ticker} />

        </div>
        
        <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 font-medium mr-1">Analysis Helpful?</span>
                <button 
                  onClick={() => handleFeedback('positive')} 
                  className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${feedback === 'positive' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}
                >
                  <HandThumbUpIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleFeedback('negative')} 
                  className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${feedback === 'negative' ? 'text-red-400 bg-red-500/10' : 'text-slate-400'}`}
                >
                  <HandThumbDownIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-2">
              <button 
                  onClick={() => setShowCompare(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                  <ScaleIcon className="w-4 h-4" />
                  Compare
              </button>

              <button
                  onClick={handleAddToPortfolio}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium whitespace-nowrap ${
                      inPortfolio 
                      ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
              >
                  {inPortfolio ? (
                      <>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Saved
                      </>
                  ) : (
                      <>
                          <ChartBarIcon className="w-4 h-4" /> Save
                      </>
                  )}
              </button>

              <div className="relative" ref={exportMenuRef}>
                  <button 
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Export
                      <ChevronDownIcon className="w-3 h-3 ml-1" />
                  </button>
                  {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                          <button onClick={handleExportJSON} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50">
                              JSON <span className="text-slate-500 text-xs ml-1">(Raw Data)</span>
                          </button>
                          <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50">
                              CSV <span className="text-slate-500 text-xs ml-1">(Spreadsheet)</span>
                          </button>
                          <button onClick={handlePrint} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                              PDF <span className="text-slate-500 text-xs ml-1">(Report)</span>
                          </button>
                      </div>
                  )}
              </div>

              <button 
                  onClick={onRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh
              </button>
            </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {safeMetrics.map((m, i) => <MetricCard key={i} metric={m} />)}
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
          <FinancialChart data={safeChartData} type="stock" />
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
              Financial Performance
            </h3>
            <span className="text-xs text-slate-500">Revenue vs Net Income</span>
          </div>
          <FinancialChart data={safeChartData} type="revenue" />
        </div>
      </div>

      {/* SWOT Analysis */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <GlobeIcon className="w-6 h-6 text-slate-400" />
            Strategic Analysis (SWOT)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SWOT Visual Radar */}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col items-center justify-center">
             <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Analysis Balance</h4>
             <SWOTRadarChart data={swotChartData} />
             <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400 max-w-[200px]">
                  Visual representation of the intensity and volume of strategic factors identified by AI.
                </p>
             </div>
          </div>

          {/* SWOT Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SWOTCard title="Strengths" items={safeSwot.strengths || []} type="s" />
              <SWOTCard title="Weaknesses" items={safeSwot.weaknesses || []} type="w" />
              <SWOTCard title="Opportunities" items={safeSwot.opportunities || []} type="o" />
              <SWOTCard title="Threats" items={safeSwot.threats || []} type="t" />
          </div>
        </div>
      </div>

      {/* Bottom Grid: News & Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white">Market Intelligence & News</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeRecentNews.map((news, i) => <NewsCard key={i} news={news} />)}
            </div>
            
            {/* Sources Display (Grounding) */}
            {data.sourceUrls && data.sourceUrls.length > 0 && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <GlobeIcon className="w-3 h-3 text-slate-500" />
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Verified Sources</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.sourceUrls.map((url, i) => (
                            <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all group"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 group-hover:bg-primary-400"></span>
                                <span className="text-xs text-slate-300 group-hover:text-white font-medium truncate max-w-[200px]">
                                    {getHostname(url)}
                                </span>
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
                {safeCompetitors.map((comp, i) => (
                    <div key={i} className="p-4 hover:bg-slate-700/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-200">{comp.name}</span>
                            <div className="flex items-center gap-3">
                                {/* Sparkline */}
                                <div title={`Market Share Trend: ${comp.marketShareTrend}`} className="w-16 h-8">
                                    <Sparkline trend={comp.marketShareTrend} />
                                </div>
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {comp.marketShare} Share
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{comp.advantage}</p>
                        
                        {/* Competitor Fields (Funding & Earnings) */}
                        {(comp.recentFunding || comp.lastEarningsReport) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {comp.recentFunding && (
                                    <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-900/50 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                        {comp.recentFunding}
                                    </span>
                                )}
                                {comp.lastEarningsReport && (
                                    <span className="text-[10px] bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded border border-indigo-900/50 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5"></span>
                                        {comp.lastEarningsReport}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};