
import React, { useState } from 'react';
import { GlobeIcon, ArrowTrendingUp, SearchIcon } from './Icons.tsx';

interface MarketExplorerProps {
  onSelect: (ticker: string) => void;
}

const REGIONS = [
  {
    id: 'americas',
    name: 'Americas',
    icon: '🌎',
    companies: [
      { name: 'Nvidia', ticker: 'NVDA', sector: 'Technology', flag: '🇺🇸', trend: 'up' },
      { name: 'Apple', ticker: 'AAPL', sector: 'Technology', flag: '🇺🇸', trend: 'up' },
      { name: 'Microsoft', ticker: 'MSFT', sector: 'Technology', flag: '🇺🇸', trend: 'stable' },
      { name: 'Amazon', ticker: 'AMZN', sector: 'Consumer', flag: '🇺🇸', trend: 'up' },
      { name: 'Tesla', ticker: 'TSLA', sector: 'Auto', flag: '🇺🇸', trend: 'down' },
      { name: 'MercadoLibre', ticker: 'MELI', sector: 'E-commerce', flag: '🇦🇷', trend: 'up' },
      { name: 'Petrobras', ticker: 'PBR', sector: 'Energy', flag: '🇧🇷', trend: 'stable' },
      { name: 'Royal Bank', ticker: 'RY', sector: 'Finance', flag: '🇨🇦', trend: 'stable' },
    ]
  },
  {
    id: 'emea',
    name: 'Europe, Middle East & Africa',
    icon: '🌍',
    companies: [
      { name: 'LVMH', ticker: 'MC.PA', sector: 'Luxury', flag: '🇫🇷', trend: 'stable' },
      { name: 'Novo Nordisk', ticker: 'NOVO-B', sector: 'Healthcare', flag: '🇩🇰', trend: 'up' },
      { name: 'ASML', ticker: 'ASML', sector: 'Technology', flag: '🇳🇱', trend: 'up' },
      { name: 'SAP', ticker: 'SAP', sector: 'Technology', flag: '🇩🇪', trend: 'up' },
      { name: 'Saudi Aramco', ticker: '2222.SR', sector: 'Energy', flag: '🇸🇦', trend: 'stable' },
      { name: 'Shell', ticker: 'SHEL', sector: 'Energy', flag: '🇬🇧', trend: 'down' },
      { name: 'Nestlé', ticker: 'NESN.SW', sector: 'Consumer', flag: '🇨🇭', trend: 'stable' },
      { name: 'Airbus', ticker: 'AIR.PA', sector: 'Industrial', flag: '🇪🇺', trend: 'up' },
    ]
  },
  {
    id: 'apac',
    name: 'Asia Pacific',
    icon: '🌏',
    companies: [
      { name: 'TSMC', ticker: 'TSM', sector: 'Technology', flag: '🇹🇼', trend: 'up' },
      { name: 'Tencent', ticker: '0700.HK', sector: 'Technology', flag: '🇨🇳', trend: 'stable' },
      { name: 'Samsung', ticker: '005930.KS', sector: 'Technology', flag: '🇰🇷', trend: 'down' },
      { name: 'Toyota', ticker: '7203.T', sector: 'Auto', flag: '🇯🇵', trend: 'up' },
      { name: 'Sony', ticker: '6758.T', sector: 'Consumer', flag: '🇯🇵', trend: 'stable' },
      { name: 'Infosys', ticker: 'INFY', sector: 'Technology', flag: '🇮🇳', trend: 'up' },
      { name: 'BHP Group', ticker: 'BHP', sector: 'Materials', flag: '🇦🇺', trend: 'stable' },
      { name: 'Alibaba', ticker: 'BABA', sector: 'E-commerce', flag: '🇨🇳', trend: 'down' },
    ]
  }
];

export const MarketExplorer: React.FC<MarketExplorerProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSelect(searchTerm);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <GlobeIcon className="w-8 h-8 text-primary-400" />
             Global Markets Explorer
           </h1>
           <p className="text-slate-400 mt-2">Discover and analyze leading companies across major economic regions.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
             <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Analyze any global company..."
               className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-500"
             />
        </form>
      </div>

      <div className="space-y-12">
        {REGIONS.map((region) => (
          <section key={region.id}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">{region.icon}</span> {region.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {region.companies.map((company) => (
                <button
                  key={company.ticker}
                  onClick={() => onSelect(company.name)}
                  className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-primary-500/50 rounded-xl p-4 text-left transition-all hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{company.flag}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      company.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
                      company.trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {company.ticker}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg group-hover:text-primary-400 transition-colors">{company.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{company.sector}</p>
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyze <ArrowTrendingUp className="w-3 h-3 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
