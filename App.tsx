import React, { useState, useCallback } from 'react';
import { analyzeCompany } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { AppState, AnalysisResult } from './types';
import { SearchIcon, GlobeIcon } from './components/Icons';

export default function App() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState(''); // Tracks the company currently being displayed
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async (companyName: string) => {
    setState(AppState.LOADING);
    setError(null);

    try {
      const result = await analyzeCompany(companyName);
      setData(result);
      setState(AppState.DASHBOARD);
      setActiveQuery(companyName); // Update active query on success
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

  // Re-run analysis on the currently active company
  const handleRefresh = useCallback(async () => {
    if (activeQuery) {
      await performAnalysis(activeQuery);
    }
  }, [activeQuery]);

  // Handle Enter key in Search Inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <div className="bg-primary-500 p-1.5 rounded-lg">
             <GlobeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">OmniAnalytica</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setState(AppState.LANDING)} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${state === AppState.LANDING ? 'bg-primary-600/10 text-primary-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            Home
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace</div>
          <button className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${state === AppState.DASHBOARD ? 'bg-primary-600/10 text-primary-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            Live Dashboard
          </button>
          <button disabled className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
            Portfolio (Pro)
          </button>
          <button disabled className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
            Forecasting (Pro)
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-900 rounded p-3 text-xs text-slate-500 border border-slate-800">
                <p>Status: <span className="text-emerald-500 font-semibold">Online</span></p>
                <p>Model: <span className="text-primary-400">Gemini 2.5 Flash</span></p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center gap-2">
             <div className="bg-primary-500 p-1 rounded">
                <GlobeIcon className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-white">Omni</span>
          </div>

          <div className="flex-1 max-w-xl mx-auto hidden md:block">
             {state === AppState.DASHBOARD && (
                 <div className="relative group">
                    <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search another company..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                    />
                 </div>
             )}
          </div>

          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 border border-slate-700 shadow-inner"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 min-h-[calc(100vh-4rem)]">
          
          {/* Landing State */}
          {state === AppState.LANDING && (
            <div className="h-full flex flex-col items-center justify-center pt-20 animate-fade-in">
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
                 
                 <div className="relative max-w-md mx-auto w-full group">
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

                 <div className="mt-12 flex items-center justify-center gap-8 text-slate-600 grayscale opacity-50">
                    <span className="text-sm font-semibold">TRUSTED BY ANALYSTS WORLDWIDE</span>
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

          {/* Dashboard State */}
          {state === AppState.DASHBOARD && data && (
            <Dashboard data={data} onRefresh={handleRefresh} />
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
      `}</style>
    </div>
  );
}