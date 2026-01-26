import React, { useState, useEffect } from 'react';
import { generateForecast } from '../services/geminiService.ts';
import { ForecastResult } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BoltIcon, XMarkIcon } from './Icons.tsx';

interface ForecastingProps {
  initialCompany: string;
}

const ForecastChart: React.FC<{ data: any[] }> = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-80 w-full flex items-center justify-center text-slate-600">No projections available</div>;
    return (
      <div className="h-80 w-full min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                itemStyle={{ fontSize: '12px' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="optimistic" name="Bull Case" stroke="#34d399" strokeWidth={3} dot={false} animationDuration={1500} />
            <Line type="monotone" dataKey="neutral" name="Base Case" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={1500} />
            <Line type="monotone" dataKey="pessimistic" name="Bear Case" stroke="#f87171" strokeWidth={3} dot={false} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
};

export const Forecasting: React.FC<ForecastingProps> = ({ initialCompany }) => {
    const [company, setCompany] = useState(initialCompany);
    const [result, setResult] = useState<ForecastResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runForecast = async (name: string) => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await generateForecast(name);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to generate AI forecast model");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialCompany) {
            setCompany(initialCompany);
            runForecast(initialCompany);
        }
    }, [initialCompany]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runForecast(company);
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in max-w-5xl mx-auto">
             <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <BoltIcon className="w-8 h-8 text-yellow-400" /> 
                        Predictive AI Forecasting
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">12-month projected valuation scenarios based on real-time neural modelling.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company or Ticker"
                        className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 w-full md:w-64"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !company}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 shadow-lg shadow-primary-900/30"
                    >
                        {loading ? 'Predicting...' : 'Run Forecast'}
                    </button>
                </form>
            </div>

            {!initialCompany && !result && !loading && (
                <div className="text-center py-24 bg-slate-900/40 rounded-[3rem] border border-slate-800/50">
                    <BoltIcon className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">Enter a company name above to generate scenario modelling</p>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                     <div className="w-16 h-16 border-t-2 border-primary-500 rounded-full animate-spin mb-8"></div>
                     <h2 className="text-xl font-black text-white mb-2">Simulating Market Variables</h2>
                     <p className="text-slate-500 uppercase font-black text-[10px] tracking-[0.2em]">Neural engines active for {company}...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-[2rem] text-center shadow-2xl">
                    <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black mb-1">Forecast Engine Error</h3>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            )}

            {result && !loading && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl min-h-[440px]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <h2 className="text-2xl font-black text-white">{result.companyName}: Valuation Targets</h2>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">Optimistic</span>
                                <span className="flex items-center gap-2 text-slate-400 bg-slate-400/10 px-3 py-1 rounded-lg">Base Case</span>
                                <span className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1 rounded-lg">Pessimistic</span>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                           <ForecastChart data={result.chartData} />
                        </div>
                    </div>

                    <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
                        <h3 className="text-xs font-black text-primary-400 mb-6 uppercase tracking-[0.3em]">AI Scenario Qualitative Analysis</h3>
                        <p className="text-slate-300 leading-relaxed text-base font-medium">
                            {result.analysis}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};