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
import { SearchIcon, GlobeIcon, ChartBarIcon, TrendingUpIcon, BoltIcon, DocumentTextIcon, BuildingLibraryIcon, HomeIcon, BriefcaseIcon, PresentationChartLineIcon, Squares2X2Icon, Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon } from './components/Icons';

const SUGGESTED_COMPANIES = [
  { name: "Nvidia", ticker: "NVDA", region: "🇺🇸 USA" },
  { name: "LVMH", ticker: "MC.PA", region: "🇫🇷 France" },
  { name: "Samsung", ticker: "005930", region: "🇰🇷 Korea" },
  { name: "Tencent", ticker: "0700.HK", region: "🇨🇳 China" },
  { name: "Toyota", ticker: "7203.T", region: "🇯🇵 Japan" },
  { name: "Novo Nordisk", ticker: "NOVO-B", region: "🇩🇰 Denmark" },
  { name: "Saudi Aramco", ticker: "2222.SR", region: "🇸🇦 Saudi" },
  { name: "Infosys", ticker: "INFY", region: "🇮🇳 India" },
  { name: "SAP", ticker: "SAP", region: "🇩🇪 Germany" },
  { name: "MercadoLibre", ticker: "MELI", region: "🇦🇷 Argentina" },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [state, setState] = useState<AppState>(AppState.SIGN_IN);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setState(AppState.WORKSPACE); // Default to Workspace instead of Landing when logged in
    } else {
      setState(AppState.SIGN_IN);
    }
  }, []);

  const performAnalysis = async (companyName: string) => {
    setState(AppState.LOADING);
    setError(null);

    try {
      const result = await analyzeCompany(companyName);
      setData(result);
      setState(AppState.DASHBOARD);
      setActiveQuery(companyName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze company. Ensure your API Key is valid.");
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
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setState(AppState.WORKSPACE);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Handle Workspace Navigation
  const handleWorkspaceNavigate = (view: string) => {
      switch(view) {
          case 'MARKETS': setState(AppState.MARKETS); break;
          case 'PORTFOLIO': setState(AppState.PORTFOLIO); break;
          case 'FORECASTING': setState(AppState.FORECASTING); break;
          default: setState(AppState.WORKSPACE);
      }
  };

  const NavItem = ({ label, icon: Icon, targetState, active, onClick }: { label: string, icon: any, targetState?: AppState, active?: boolean, onClick?: () => void }) => {
    const isActive = active || state === targetState;
    return (
        <button 
            onClick={onClick || (() => targetState !== undefined && setState(targetState))} 
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
  }

  if (state === AppState.SIGN_IN || state === AppState.SIGN_UP) {
    return (
      <Auth 
        state={state} 
        onSwitchMode={setState} 
        onSuccess={handleAuthSuccess} 
      />
    );
  }

  // Determine if search bar should be visible in header
  const showHeaderSearch = state !== AppState.LANDING;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop Only */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-950 border-r border-slate-800/50 fixed h-full z-10 shadow-2xl transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-72' : 'w-20'}`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white p-1 rounded-full shadow-lg z-20 flex items-center justify-center transition-colors hover:scale-110"
        >
          {isSidebarExpanded ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
        </button>

        {/* Logo Area */}
        <div className={`p-8 pb-8 flex items-center ${isSidebarExpanded ? 'gap-3' : 'justify-center'} relative`}>
          <div className="bg-gradient-to-tr from-primary-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-primary-900/20 shrink-0">
             <GlobeIcon className="w-6 h-6 text-white" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <span className="text-lg font-bold tracking-tight text-white leading-none block whitespace-nowrap">Global</span>
              <span className="text-xs text-primary-400 font-medium tracking-widest uppercase whitespace-nowrap">Analytics</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-8 overflow-y-auto py-4 scrollbar-none">
          
          {/* Main Group */}
          <div className="space-y-1">
             {isSidebarExpanded && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in">Platform</div>}
             <NavItem label="Home" icon={HomeIcon} targetState={AppState.LANDING} />
             <NavItem label="Workspace" icon={Squares2X2Icon} targetState={AppState.WORKSPACE} />
             <NavItem 
                label="Active Analysis" 
                icon={PresentationChartLineIcon} 
                onClick={() => {
                    if (data) setState(AppState.DASHBOARD);
                    else setState(AppState.LANDING);
                }}
                active={state === AppState.DASHBOARD}
            />
          </div>

          {/* Tools Group */}
          <div className="space-y-1">
             {isSidebarExpanded && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in">Discovery & Tools</div>}
             <NavItem label="Global Markets" icon={BuildingLibraryIcon} targetState={AppState.MARKETS} />
             <NavItem label="Saved Companies" icon={BriefcaseIcon} targetState={AppState.PORTFOLIO} />
             <NavItem label="AI Forecasting" icon={BoltIcon} targetState={AppState.FORECASTING} />
          </div>

          {/* Account Group */}
          <div className="space-y-1">
            {isSidebarExpanded && <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in">Settings</div>}
            <NavItem label="Account Details" icon={Cog6ToothIcon} targetState={AppState.ACCOUNT} />
          </div>

        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950">
            {user && (
              <div 
                className={`flex items-center rounded-xl hover:bg-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-800 group ${isSidebarExpanded ? 'gap-3 p-3' : 'justify-center p-2'}`}
                onClick={() => setState(AppState.ACCOUNT)}
                title={!isSidebarExpanded ? user.name : ''}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                  <div className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>
              </div>
            )}
            
            {isSidebarExpanded && (
              <button 
                onClick={handleSignOut}
                className="mt-2 w-full py-2 text-xs font-medium text-slate-500 hover:text-red-400 transition-colors animate-fade-in"
              >
                Log Out
              </button>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 relative transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:ml-72' : 'md:ml-20'}`}
      >
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center gap-2">
             <div className="bg-primary-500 p-1 rounded">
                <GlobeIcon className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-white">Global Analytics</span>
          </div>

          <div className="flex-1 max-w-xl mx-auto hidden md:block">
             {showHeaderSearch && (
                 <div className="relative group">
                    <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search for any company..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600 shadow-sm"
                    />
                 </div>
             )}
          </div>

          <div className="flex items-center gap-4">
             {/* Mobile Sign Out */}
             <button onClick={handleSignOut} className="md:hidden text-xs text-slate-400 hover:text-white">Sign Out</button>
             <div 
               onClick={() => setState(AppState.ACCOUNT)}
               className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 border border-slate-700 shadow-inner flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all md:hidden"
             >
                {user?.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 min-h-[calc(100vh-4rem)]">
          
          {/* Landing State */}
          {state === AppState.LANDING && (
            <div className="h-full flex flex-col items-center pt-10 animate-fade-in pb-20">
              <div className="text-center max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-semibold mb-6 border border-primary-500/20">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                    Powered by Google Gemini 2.5
                 </div>
                 <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
                    Analyze the world <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-500">in real-time.</span>
                 </h1>
                 <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                    Instant access to financial modeling, competitive landscaping, and SWOT analysis for any public or private entity worldwide.
                 </p>
                 
                 <div className="relative max-w-md mx-auto w-full group mb-12">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 shadow-2xl">
                       <input 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter company name (e.g. Nvidia, Stripe)..."
                          className="w-full bg-transparent border-none text-white px-6 py-4 text-lg focus:outline-none placeholder:text-slate-600 rounded-lg"
                       />
                       <button 
                          onClick={() => handleSearch()}
                          className="mr-2 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors border border-slate-700"
                       >
                          <SearchIcon className="w-6 h-6" />
                       </button>
                    </div>
                 </div>

                 {/* Features Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-16">
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                         <GlobeIcon className="w-6 h-6 text-indigo-400 mb-2" />
                         <h3 className="font-semibold text-white text-sm">Global Analysis</h3>
                         <p className="text-xs text-slate-500 mt-1">Real-time financials & market position.</p>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                         <BoltIcon className="w-6 h-6 text-yellow-400 mb-2" />
                         <h3 className="font-semibold text-white text-sm">AI Forecasting</h3>
                         <p className="text-xs text-slate-500 mt-1">12-month predictive stock scenarios.</p>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                         <ChartBarIcon className="w-6 h-6 text-emerald-400 mb-2" />
                         <h3 className="font-semibold text-white text-sm">Portfolio</h3>
                         <p className="text-xs text-slate-500 mt-1">Track & monitor your favorite assets.</p>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                         <DocumentTextIcon className="w-6 h-6 text-primary-400 mb-2" />
                         <h3 className="font-semibold text-white text-sm">SWOT Engine</h3>
                         <p className="text-xs text-slate-500 mt-1">Deep strategic deep-dives.</p>
                     </div>
                 </div>

                 {/* Global Markets Explorer */}
                 <div className="w-full">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
                         <GlobeIcon className="w-4 h-4" /> Explore Global Markets
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {SUGGESTED_COMPANIES.map(c => (
                            <button
                                key={c.ticker}
                                onClick={() => { setQuery(c.name); performAnalysis(c.name); }}
                                className="group flex items-center gap-3 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-800 hover:border-primary-500/30 rounded-full transition-all text-left"
                            >
                                <span className="text-xl bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center">{c.region.split(' ')[0]}</span>
                                <div>
                                    <span className="block text-sm text-slate-200 group-hover:text-white font-medium">{c.name}</span>
                                    <span className="block text-[10px] text-slate-500 group-hover:text-slate-400">{c.ticker} • {c.region.split(' ').slice(1).join(' ')}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {state === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
               <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-t-4 border-primary-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-3 border-t-4 border-indigo-500 rounded-full animate-spin-slow opacity-70"></div>
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Analyzing {activeQuery || query}...</h2>
               <p className="text-slate-400 text-center max-w-md">
                 Gathering real-time market data, generating financial models, and synthesizing news sentiment.
               </p>
            </div>
          )}

          {/* Error State */}
          {state === AppState.ERROR && (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
               <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
               </div>
               <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
               <p className="text-red-400 mb-6 text-center max-w-md">{error}</p>
               <button 
                  onClick={() => setState(AppState.LANDING)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
               >
                  Try Again
               </button>
            </div>
          )}

          {/* Workspace State (New Main Hub) */}
          {state === AppState.WORKSPACE && (
            <Workspace user={user} onNavigate={handleWorkspaceNavigate} />
          )}

          {/* Account Settings State */}
          {state === AppState.ACCOUNT && user && (
            <Account user={user} onUpdateUser={handleUserUpdate} />
          )}

          {/* Dashboard State */}
          {state === AppState.DASHBOARD && data && (
            <Dashboard data={data} onRefresh={handleRefresh} />
          )}

          {/* Global Markets State */}
          {state === AppState.MARKETS && (
            <MarketExplorer onSelect={performAnalysis} />
          )}

          {/* Portfolio State */}
          {state === AppState.PORTFOLIO && (
             <Portfolio onSelectCompany={performAnalysis} />
          )}

          {/* Forecasting State */}
          {state === AppState.FORECASTING && (
              <Forecasting initialCompany={activeQuery} />
          )}

        </div>
      </main>

      <style>{`
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}