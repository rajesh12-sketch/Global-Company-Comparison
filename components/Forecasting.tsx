import React, { useState, useEffect } from 'react';
import { generateForecast } from '../services/geminiService';
import { ForecastResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BoltIcon, ArrowPathIcon } from './Icons';

interface ForecastingProps {
  initialCompany: string;
}

const ForecastChart: React.FC<{ data: any[] }> = ({ data }) => {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                itemStyle={{ fontSize: '12px' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="optimistic" name="Bull Case" stroke="#34d399" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="neutral" name="Base Case" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="pessimistic" name="Bear Case" stroke="#f87171" strokeWidth={2} dot={false} />
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
            setError(err.message || "Failed to generate forecast");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialCompany) {
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
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <BoltIcon className="w-8 h-8 text-yellow-400" /> 
                        AI Forecasting
                    </h1>
                    <p className="text-slate-400 mt-2">Generate 12-month projected scenarios based on current market drivers.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company Name or Ticker"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 w-full md:w-64"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !company}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                        {loading ? 'Running...' : 'Run Forecast'}
                    </button>
                </form>
            </div>

            {!initialCompany && !result && !loading && (
                <div className="text-center py-20 text-slate-500">
                    <p>Enter a company name above to generate a financial forecast.</p>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="text-slate-400">Crunching market numbers...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center">
                    {error}
                </div>
            )}

            {result && !loading && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{result.companyName}: 12-Month Price Targets</h2>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Bull</span>
                                <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Base</span>
                                <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-red-400"></span> Bear</span>
                            </div>
                        </div>
                        <ForecastChart data={result.chartData} />
                    </div>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">AI Scenario Analysis</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {result.analysis}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};