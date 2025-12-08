import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { ChartDataPoint } from '../types';

interface FinancialChartProps {
  data: ChartDataPoint[];
  type: 'stock' | 'revenue';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} style={{ color: p.color }}>
            {p.name}: ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const FinancialChart: React.FC<FinancialChartProps> = ({ data, type }) => {
  if (type === 'stock') {
    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="stockPrice" 
              name="Stock Price"
              stroke="#38bdf8" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#38bdf8", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}M`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="profit" name="Net Income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const Sparkline: React.FC<{ trend?: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  const data = React.useMemo(() => {
    let current = 50;
    // Generate synthetic history based on trend
    return Array.from({ length: 20 }).map((_, i) => {
       const noise = Math.random() * 10 - 5;
       let drift = 0;
       if (trend === 'up') drift = 3;
       if (trend === 'down') drift = -3;
       
       current += drift + noise;
       return { value: current };
    });
  }, [trend]);

  const color = trend === 'up' ? '#34d399' : trend === 'down' ? '#f87171' : '#94a3b8';

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={true} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};