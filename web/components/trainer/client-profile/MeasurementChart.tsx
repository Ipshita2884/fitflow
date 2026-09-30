"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from "@/components/ui/card";

export function MeasurementChart({ data }: { data: any[] }) {
  // Format data for Recharts
  const chartData = data.map(m => ({
    date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: m.weightKg,
    bodyFat: m.bodyFatPercentage
  })).reverse(); // Reverse to chronological order (oldest to newest)

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30">
        <p className="text-slate-500 text-sm">Not enough data to generate chart.</p>
      </div>
    );
  }

  return (
    <Card glass className="p-6 border-slate-500/20 h-96">
      <h3 className="text-lg font-bold text-surface mb-6">Weight Progression</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke="#f59e0b" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWeight)" 
            name="Weight (kg)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
