
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeCompany } from './services/geminiService';
import { authService } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Portfolio } from './components/Portfolio';
import { Forecasting } from './components/Forecasting';
import { MarketExplorer } from './components/MarketExplorer';
import { Workspace } from './components/Workspace';
import { Account } from './components/Account';
import { AppState, AnalysisResult, User } from './types';
import { 
  SearchIcon, GlobeIcon, ChartBarIcon, BoltIcon, 
  BuildingLibraryIcon, HomeIcon, BriefcaseIcon, 
  PresentationChartLineIcon, Squares2X2Icon, Cog6ToothIcon, 
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon, Bars3Icon
} from './components/Icons';

export default function App() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [state, setState] = useState<AppState>(AppState.SIGN_IN);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setState(AppState.WORKSPACE);
    } else {
      setState(AppState.SIGN_IN);
    }
  }, []);

  const performAnalysis = async (companyName: string) => {
    setState(AppState.LOADING);
    setError(null);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);

    try {
      const result = await analyzeCompany(companyName);
      setData(result);
      setState(AppState.DASHBOARD);
      setActiveQuery(companyName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze company.");
      setState(AppState.ERROR);
    }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    await performAnalysis(query);
  }, [query]);

  const handleRefresh = useCallback(async () => {
    if (activeQuery) {
      await performAnalysis(activeQuery);
    }
  }, [activeQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setUser(null);
    setData(null);
    setQuery('');
    setActiveQuery('');
    setState(AppState.SIGN_IN);
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setState(AppState.WORKSPACE);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
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

  const NavItem = ({ label, icon: Icon, targetState, active, onClick, mobile }: { label: string, icon: any, targetState?: AppState, active?: boolean, onClick?: () => void, mobile?: boolean }) => {
    const isActive = active || state === targetState;
    
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
          {isActive && <div className="absolute bottom-0 w-8 h-1 bg-primary-500 rounded-t-full"></div>}
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
          ? 'bg-primary-500/10 text-primary-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        } ${isSidebarExpanded ? 'px-4' : 'px-2 justify-center'}`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"></div>}
        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
      </button>
    );
  };

  if (state === AppState.SIGN_IN || state === AppState.SIGN_UP) {
    return <Auth state={state} onSwitchMode={setState} onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans selection:bg-primary-500/30 overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar Drawer */}
      <aside 
        className={`fixed md:sticky top-0 left-0 flex flex-col bg-slate-900 border-r border-slate-800 h-full z-[70] transition-all duration-300 ease-in-out shadow-2xl 
          ${isSidebarExpanded ? 'w-72' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          md:translate-x-0`}
      >
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="hidden md:flex absolute -right-3 top-10 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white p-1 rounded-full shadow-lg z-40 transition-all hover:scale-110"
        >
          {isSidebarExpanded ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
        </button>

        <div className={`p-8 flex items-center justify-between ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary-500 to-indigo-600 p-2 rounded-xl shadow-lg shrink-0">
               <GlobeIcon className="w-6 h-6 text-white" />
            </div>
            {isSidebarExpanded && (
              <div className="animate-fade-in whitespace-nowrap">
                <span className="text-lg font-bold tracking-tight text-white block">Global</span>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Analytics</span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
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
          <div className="space-y-1">
            {(isSidebarExpanded || isMobileMenuOpen) && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</div>}
            <NavItem label="Account" icon={Cog6ToothIcon} targetState={AppState.ACCOUNT} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          {user && (
            <div 
              className={`flex items-center rounded-xl hover:bg-slate-800 p-2 transition-all cursor-pointer group ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}
              onClick={() => { setState(AppState.ACCOUNT); setIsMobileMenuOpen(false); }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                 {user.name.charAt(0).toUpperCase()}
              </div>
              {(isSidebarExpanded || isMobileMenuOpen) && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                </div>
              )}
            </div>
          )}
          {(isSidebarExpanded || isMobileMenuOpen) && (
            <button onClick={handleSignOut} className="mt-2 w-full py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors">Sign Out</button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <main className={`flex-1 relative transition-all duration-300 ease-in-out pb-20 md:pb-0`}>
        
        {/* Top Navbar (Mobile Friendly) */}
        <header className="sticky top-0 z-40 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <div className="hidden md:flex bg-primary-500 p-1.5 rounded-lg shadow-lg shadow-primary-500/20">
               <GlobeIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Global Analytics</h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-auto px-4">
             {state !== AppState.LANDING && (
                 <div className="relative group">
                    <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search global stocks..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                    />
                 </div>
             )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              {isMobileSearchOpen ? <XMarkIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
            </button>
            <div 
              onClick={() => setState(AppState.ACCOUNT)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer ring-2 ring-slate-800"
            >
               {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile Search Overlay */}
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen">
          {state === AppState.LANDING && (
            <div className="flex flex-col items-center pt-8 md:pt-16 animate-fade-in text-center px-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold mb-8 border border-primary-500/20">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                Intelligence Layer v3.0
              </div>
              <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-8 leading-[1.1]">
                Smart Financial <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-500">Global Data Layer</span>
              </h1>
              <p className="text-base md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
                Unlock professional-grade financial modeling, SWOT analysis, and real-time news sentiment for any entity worldwide.
              </p>
              
              <div className="w-full max-w-xl mx-auto mb-16 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/50 to-indigo-600/50 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-1 shadow-2xl">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Company name or ticker..."
                    className="flex-1 bg-transparent border-none text-white px-6 py-4 text-base md:text-lg focus:outline-none placeholder:text-slate-600"
                  />
                  <button 
                    onClick={() => handleSearch()}
                    className="m-1 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary-500/30 active:scale-95"
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Analyze</span>
                  </button>
                </div>
              </div>

              {/* Quick Regional Access */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px w-12 bg-slate-800"></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Regional Leaders</h3>
                  <div className="h-px w-12 bg-slate-800"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { name: "Nvidia", flag: "🇺🇸", t: "NVDA" },
                    { name: "LVMH", flag: "🇫🇷", t: "MC.PA" },
                    { name: "Samsung", flag: "🇰🇷", t: "005930" },
                    { name: "Tencent", flag: "🇨🇳", t: "0700" },
                    { name: "Toyota", flag: "🇯🇵", t: "7203" }
                  ].map(c => (
                    <button
                      key={c.t}
                      onClick={() => performAnalysis(c.name)}
                      className="flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-primary-500/50 rounded-2xl transition-all"
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="font-bold text-slate-200 text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
               <div className="relative w-32 h-32 mb-10">
                  <div className="absolute inset-0 border-t-2 border-primary-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-t-2 border-indigo-500 rounded-full animate-spin-slow opacity-50"></div>
                  <div className="absolute inset-8 border-t-2 border-purple-500 rounded-full animate-spin opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GlobeIcon className="w-8 h-8 text-primary-400 animate-pulse" />
                  </div>
               </div>
               <h2 className="text-2xl font-black text-white mb-3">Synthesizing Market Intelligence</h2>
               <p className="text-slate-500 text-sm max-w-sm px-6 leading-relaxed uppercase tracking-widest font-bold">
                 Processing real-time data for {activeQuery || query}...
               </p>
            </div>
          )}

          {state === AppState.ERROR && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
               <div className="w-20 h-20 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mb-8">
                  <XMarkIcon className="w-10 h-10 text-red-500" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Analysis Interrupted</h2>
               <p className="text-red-400 text-sm max-w-md mb-8">{error}</p>
               <button onClick={() => setState(AppState.LANDING)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-800 transition-all">Try Different Entity</button>
            </div>
          )}

          {state === AppState.WORKSPACE && <Workspace user={user} onNavigate={handleWorkspaceNavigate} />}
          {state === AppState.ACCOUNT && user && <Account user={user} onUpdateUser={handleUserUpdate} onBack={() => setState(AppState.WORKSPACE)} />}
          {state === AppState.DASHBOARD && data && <Dashboard data={data} onRefresh={handleRefresh} />}
          {state === AppState.MARKETS && <MarketExplorer onSelect={performAnalysis} />}
          {state === AppState.PORTFOLIO && <Portfolio onSelectCompany={performAnalysis} />}
          {state === AppState.FORECASTING && <Forecasting initialCompany={activeQuery} />}
        </div>

        {/* Mobile Bottom Navigation (optional, kept for quick reach) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 flex items-center px-2">
           <NavItem label="Home" icon={HomeIcon} targetState={AppState.LANDING} mobile />
           <NavItem label="Work" icon={Squares2X2Icon} targetState={AppState.WORKSPACE} mobile />
           <NavItem label="Scan" icon={BuildingLibraryIcon} targetState={AppState.MARKETS} mobile />
           <NavItem label="Vault" icon={BriefcaseIcon} targetState={AppState.PORTFOLIO} mobile />
           <NavItem label="Account" icon={Cog6ToothIcon} targetState={AppState.ACCOUNT} mobile />
        </nav>
      </main>

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
