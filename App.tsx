import React, { useState, useCallback, useEffect } from 'react';
import { analyzeCompany } from './services/geminiService.ts';
import { authService } from './services/authService.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { Portfolio } from './components/Portfolio.tsx';
import { Forecasting } from './components/Forecasting.tsx';
import { MarketExplorer } from './components/MarketExplorer.tsx';
import { Workspace } from './components/Workspace.tsx';
import { Account } from './components/Account.tsx';
import { Auth } from './components/Auth.tsx';
import { AppState, AnalysisResult, User } from './types.ts';
import { 
  SearchIcon, GlobeIcon, ChartBarIcon, BoltIcon, 
  BuildingLibraryIcon, HomeIcon, BriefcaseIcon, 
  PresentationChartLineIcon, Squares2X2Icon, Cog6ToothIcon, 
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon, Bars3Icon,
  ArrowPathIcon, TrendingUpIcon, GALogo
} from './components/Icons.tsx';

const DEFAULT_USER: User = {
  id: 'guest_analyst',
  name: 'Senior Analyst',
  email: 'analyst@global-data.io',
  jobTitle: 'Investment Strategy Lead',
  address: 'London, UK'
};

const MarketTicker = () => (
  <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap py-1">
    {[
      { n: 'S&P 500', v: '5,234.1', c: '+1.2%', t: 'up' },
      { n: 'NASDAQ', v: '16,428.5', c: '+1.5%', t: 'up' },
      { n: 'FTSE 100', v: '7,930.9', c: '-0.2%', t: 'down' },
      { n: 'NIKKEI', v: '40,888.4', c: '+0.5%', t: 'up' },
    ].map((m, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-500">{m.n}</span>
        <span className="text-[10px] font-bold text-white">{m.v}</span>
        <span className={`text-[9px] font-black ${m.t === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{m.c}</span>
      </div>
    ))}
  </div>
);

const GlobalClocks = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (offset: number) => {
    const d = new Date(time.getTime() + (offset * 3600000));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
      <div className="flex flex-col items-center">
        <span className="text-white opacity-80">{formatTime(0)}</span>
        <span>LON</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-white opacity-80">{formatTime(-5)}</span>
        <span>NYC</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-white opacity-80">{formatTime(9)}</span>
        <span>TKY</span>
      </div>
    </div>
  );
};

export default function App() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
      // After selection, we might need to restart or just retry
      if (activeQuery) performAnalysis(activeQuery);
    }
  };

  const performAnalysis = async (companyName: string, isSoftRefresh: boolean = false) => {
    if (!companyName || !companyName.trim()) return;

    if (needsApiKey) {
      handleOpenKeyDialog();
      return;
    }

    if (!isSoftRefresh) {
      setState(AppState.LOADING);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);

    try {
      const result = await analyzeCompany(companyName);
      if (!result || !result.profile) {
        throw new Error("Analysis engine could not locate the requested dossier. Please try a more specific ticker or company name.");
      }
      setData(result);
      setState(AppState.DASHBOARD);
      setActiveQuery(companyName);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to analyze company dossier.";
      setError(msg);
      if (!isSoftRefresh) {
        setState(AppState.ERROR);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    await performAnalysis(query);
  }, [query]);

  const handleRefresh = useCallback(async () => {
    if (activeQuery) {
      await performAnalysis(activeQuery, true);
    }
  }, [activeQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleWorkspaceNavigate = (view: string) => {
    switch(view) {
      case 'MARKETS': setState(AppState.MARKETS); break;
      case 'PORTFOLIO': setState(AppState.PORTFOLIO); break;
      case 'FORECASTING': setState(AppState.FORECASTING); break;
      default: setState(AppState.WORKSPACE);
    }
    setIsMobileMenuOpen(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('global_comp_session');
    setUser(DEFAULT_USER);
    setState(AppState.LANDING);
  };

  const NavItem = ({ label, icon: Icon, targetState, active, onClick, mobile }: { label: string, icon: any, targetState?: AppState, active?: boolean, onClick?: () => void, mobile?: boolean }) => {
    const isActive = active || (targetState !== undefined && state === targetState);
    
    if (mobile) {
      return (
        <button 
          onClick={() => {
            if (onClick) onClick();
            else if (targetState !== undefined) setState(targetState);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
            isActive ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">{label}</span>
          {isActive && <div className="absolute bottom-0 w-8 h-1 bg-primary-400 rounded-t-full"></div>}
        </button>
      );
    }

    return (
      <button 
        onClick={() => {
          if (onClick) onClick();
          else if (targetState !== undefined) setState(targetState);
          setIsMobileMenuOpen(false);
        }} 
        title={!isSidebarExpanded ? label : ''}
        className={`w-full text-left py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 relative overflow-hidden group ${
          isActive 
          ? 'bg-primary-400/10 text-primary-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        } ${isSidebarExpanded ? 'px-4' : 'px-2 justify-center'}`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400 rounded-r-full"></div>}
        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans selection:bg-primary-400/30 overflow-x-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Render Auth Screen if in Auth state */}
      {(state === AppState.SIGN_IN || state === AppState.SIGN_UP) && (
        <Auth 
          state={state as any} 
          onSwitchMode={(m) => setState(m)} 
          onSuccess={(u) => { setUser(u); setState(AppState.WORKSPACE); }} 
          onCancel={() => setState(AppState.LANDING)}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 left-0 flex flex-col bg-slate-900 border-r border-slate-800 h-screen z-[70] transition-all duration-300 ease-in-out shadow-2xl 
          ${isSidebarExpanded ? 'w-72' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          md:translate-x-0 shrink-0`}
      >
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="hidden md:flex absolute -right-3 top-10 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white p-1 rounded-full shadow-lg z-40 transition-all hover:scale-110"
        >
          {isSidebarExpanded ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
        </button>

        <div className={`p-8 flex items-center justify-between ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="p-1 shrink-0">
               <GALogo className="w-12 h-12" />
            </div>
            {isSidebarExpanded && (
              <div className="animate-fade-in whitespace-nowrap">
                <span className="text-xl font-black tracking-tighter text-white block leading-none">GA</span>
                <span className="text-[10px] text-primary-400 font-black uppercase tracking-[0.2em] leading-none mt-1">Global Analytics</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-none py-2">
          <div className="space-y-1">
            {(isSidebarExpanded || isMobileMenuOpen) && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform</div>}
            <NavItem label="Home" icon={HomeIcon} targetState={AppState.LANDING} />
            <NavItem label="Workspace" icon={Squares2X2Icon} targetState={AppState.WORKSPACE} />
            <NavItem label="Analysis" icon={PresentationChartLineIcon} onClick={() => data ? setState(AppState.DASHBOARD) : setState(AppState.LANDING)} active={state === AppState.DASHBOARD} />
          </div>
          <div className="space-y-1">
            {(isSidebarExpanded || isMobileMenuOpen) && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</div>}
            <NavItem label="Markets" icon={BuildingLibraryIcon} targetState={AppState.MARKETS} />
            <NavItem label="Portfolio" icon={BriefcaseIcon} targetState={AppState.PORTFOLIO} />
            <NavItem label="AI Forecast" icon={BoltIcon} targetState={AppState.FORECASTING} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div 
            className={`flex items-center rounded-xl hover:bg-slate-800 p-2 transition-all cursor-pointer group ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}
            onClick={() => { setState(AppState.ACCOUNT); setIsMobileMenuOpen(false); }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-slate-950 shrink-0 shadow-lg">
               {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {(isSidebarExpanded || isMobileMenuOpen) && (
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-white truncate">{user.name || 'Analyst'}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email || 'offline@system.io'}</div>
              </div>
            )}
          </div>
          {isSidebarExpanded && (
            <div className="mt-4 px-2 text-[9px] text-slate-600 font-medium leading-tight">
               © 2025 Global Analytics. <br />
               Strategic Intel Platform.
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 relative pb-20 md:pb-0 overflow-y-auto h-screen scroll-smooth">
        
        <header className="sticky top-0 z-40 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white">
              <Bars3Icon className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">Intel Repository</h1>
          </div>

          <div className="flex-1 max-w-xl mx-auto px-4 hidden md:block">
             {state !== AppState.LANDING && (
                 <div className="relative group">
                    <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Identify corporate entity..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-400/50 transition-all"
                    />
                 </div>
             )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg">
              {isMobileSearchOpen ? <XMarkIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
            </button>
            <div onClick={() => setState(AppState.ACCOUNT)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-slate-950 cursor-pointer ring-2 ring-slate-800">
               {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {isMobileSearchOpen && (
          <div className="md:hidden sticky top-16 z-40 bg-slate-950/95 backdrop-blur-md p-4 border-b border-slate-800 animate-fade-in shadow-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Analyze company..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white"
              />
            </div>
          </div>
        )}

        <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] relative">
          
          {state === AppState.LANDING && (
            <div className="flex flex-col items-center pt-2 md:pt-4 animate-fade-in relative">
              <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-4 mb-10 flex flex-wrap items-center justify-between gap-6 shadow-xl ring-1 ring-white/5 no-print">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Core Engine 3.1 Pro Online</span>
                  </div>
                  <div className="h-4 w-px bg-slate-800"></div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Neural Nodes: <span className="text-white">Active (128)</span>
                  </div>
                </div>
                <div className="hidden lg:block flex-1 max-w-md border-x border-slate-800 px-6 overflow-hidden">
                  <MarketTicker />
                </div>
                <GlobalClocks />
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
                 <GALogo className="w-[80vw] h-[80vw] translate-y-[-10%]" />
              </div>

              <div className="z-10 text-center max-w-4xl px-4">
                <div className="flex flex-col items-center mb-6">
                   <GALogo className="w-64 h-64 md:w-96 md:h-96 drop-shadow-[0_0_60px_rgba(212,175,55,0.25)] mb-4" />
                   <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-[1.05]">
                      Lead Strategic <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5DEB3] to-[#B8860B]">Global Intelligence</span>
                   </h1>
                </div>
                
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
                  Professional entity analysis platform powered by proprietary neural SWOT modeling and real-time market grounding.
                </p>

                <div className="w-full max-w-2xl mx-auto mb-16 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Analyze global stock, ticker, or entity..."
                    className="relative w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50 shadow-2xl transition-all backdrop-blur-md"
                  />
                  <button onClick={() => handleSearch()} className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-400 text-slate-950 font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 active:scale-95 shadow-lg">
                    <SearchIcon className="w-4 h-4" /> Execute Scan
                  </button>
                </div>

                <div className="flex gap-4 justify-center mb-16">
                   <button onClick={() => setState(AppState.SIGN_IN)} className="px-10 py-4 bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-2xl">Authorized Analyst Login</button>
                   <button onClick={() => setState(AppState.WORKSPACE)} className="px-10 py-4 bg-primary-600/10 border border-primary-400/20 text-primary-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary-600/20 transition-all active:scale-95 shadow-2xl">Guest Observation Deck</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] backdrop-blur-sm hover:border-primary-400/30 transition-all group">
                    <div className="w-12 h-12 bg-primary-400/10 rounded-2xl flex items-center justify-center mb-6 border border-primary-400/20 group-hover:scale-110 transition-transform">
                      <BoltIcon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-white font-bold mb-3 text-lg">Predictive Models</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">AI-driven trajectory forecasting based on historical volatility and sector trends.</p>
                  </div>
                  <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] backdrop-blur-sm hover:border-primary-400/30 transition-all group">
                    <div className="w-12 h-12 bg-primary-400/10 rounded-2xl flex items-center justify-center mb-6 border border-primary-400/20 group-hover:scale-110 transition-transform">
                      <GlobeIcon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-white font-bold mb-3 text-lg">Live Grounding</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Direct synchronization with SEC filings and global fiscal news outlets.</p>
                  </div>
                  <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] backdrop-blur-sm hover:border-primary-400/30 transition-all group">
                    <div className="w-12 h-12 bg-primary-400/10 rounded-2xl flex items-center justify-center mb-6 border border-primary-400/20 group-hover:scale-110 transition-transform">
                      <PresentationChartLineIcon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-white font-bold mb-3 text-lg">Dossier Engine</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Automated SWOT matrix generation and comprehensive peer benchmarking.</p>
                  </div>
                </div>

                <div className="mt-20 py-10 border-t border-slate-800/50 flex flex-col items-center gap-4">
                  <GALogo className="w-12 h-12 opacity-30" />
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                    © 2025 GLOBAL ANALYTICS | PROPRIETARY DATA INTEL | ALL RIGHTS RESERVED
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in relative">
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                  <GALogo className="w-[40vw] h-[40vw]" />
               </div>
               <div className="relative">
                 <div className="w-20 h-20 border-t-2 border-primary-400 rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(212,175,55,0.2)]"></div>
                 <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">Compiling Lead Intelligence</h2>
                 <p className="text-primary-400 text-xs tracking-[0.4em] font-black uppercase">Decrypting Global Analytics Dossier for {activeQuery || query}...</p>
               </div>
            </div>
          )}

          {state === AppState.ERROR && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in p-8 bg-red-500/5 rounded-[3rem] border border-red-500/10 backdrop-blur-xl">
               <div className="w-24 h-24 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mb-8 shadow-2xl">
                  <XMarkIcon className="w-12 h-12 text-red-500" />
               </div>
               <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Sync Failure</h2>
               <p className="text-red-400 text-base max-w-md mb-12 leading-relaxed font-medium">{error}</p>
               
               {error?.toLowerCase().includes('api key') && (
                 <div className="mb-8 p-4 bg-primary-400/10 border border-primary-400/20 rounded-2xl max-w-md">
                   <p className="text-primary-400 text-sm mb-4 font-bold">It looks like your Gemini API key is missing or invalid. You need to select a valid API key from a paid Google Cloud project.</p>
                   <button 
                     onClick={handleOpenKeyDialog}
                     className="px-6 py-2 bg-primary-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary-300 transition-all"
                   >
                     Select API Key
                   </button>
                   <p className="mt-2 text-[10px] text-slate-500">Note: You must have billing enabled on your Google Cloud project.</p>
                 </div>
               )}

               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => performAnalysis(activeQuery || query)} 
                    className="px-12 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 hover:shadow-primary-400/20"
                  >
                    <ArrowPathIcon className="w-5 h-5" /> Re-Scan Entity
                  </button>
                  <button 
                    onClick={() => setState(AppState.LANDING)} 
                    className="px-12 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-2xl border border-slate-800 transition-all flex items-center gap-2"
                  >
                    <HomeIcon className="w-5 h-5" /> Return to Hub
                  </button>
               </div>
            </div>
          )}

          {state === AppState.WORKSPACE && <Workspace user={user} onNavigate={handleWorkspaceNavigate} />}
          {state === AppState.ACCOUNT && user && <Account user={user} onUpdateUser={handleUserUpdate} onBack={() => setState(AppState.WORKSPACE)} onLogout={handleLogout} />}
          {state === AppState.DASHBOARD && data && <Dashboard data={data} onRefresh={handleRefresh} isRefreshing={isRefreshing} refreshError={error} />}
          {state === AppState.MARKETS && <MarketExplorer onSelect={performAnalysis} />}
          {state === AppState.PORTFOLIO && <Portfolio onSelectCompany={performAnalysis} />}
          {state === AppState.FORECASTING && <Forecasting initialCompany={activeQuery} />}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 flex items-center px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <NavItem label="Home" icon={HomeIcon} targetState={AppState.LANDING} mobile />
           <NavItem label="Work" icon={Squares2X2Icon} targetState={AppState.WORKSPACE} mobile />
           <NavItem label="Scan" icon={BuildingLibraryIcon} targetState={AppState.MARKETS} mobile />
           <NavItem label="Vault" icon={BriefcaseIcon} targetState={AppState.PORTFOLIO} mobile />
           <NavItem label="System" icon={Cog6ToothIcon} targetState={AppState.ACCOUNT} mobile />
        </nav>
      </main>

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}