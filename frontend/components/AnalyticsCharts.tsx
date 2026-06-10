'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const COLORS = {
  primary: '#3b82f6',
  emerald: '#10b981',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e'
};

export default function AnalyticsCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics/overview')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // Premium Loading Skeleton with Shimmer
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`bg-white dark:bg-[#12121a] rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-white/5 ${i === 2 ? 'lg:col-span-2' : ''}`}>
            <div className="animate-shimmer h-7 w-48 rounded-lg mb-6" />
            <div className="animate-shimmer h-[300px] rounded-2xl" style={{ animationDelay: `${i * 150}ms` }} />
          </div>
        ))}
      </div>
    );
  }
  
  if (!data) return null;

  return (
    <div className="space-y-8 mt-10">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-60" />
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-blue-500/25">
            <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Performance Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            Data-driven insights across all evaluation metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Score Distribution Chart */}
        <div className="group bg-white dark:bg-[#12121a] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 dark:border-white/5 hover:border-blue-200/50 dark:hover:border-blue-500/20 overflow-hidden relative">
          
          {/* Background Decoration */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/30 dark:border-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Score Distribution</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Frequency Analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-gradient-to-br from-gray-50/50 to-transparent dark:from-white/[0.02] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.score_distribution}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="bucket" 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
                      padding: '12px 16px',
                      color: '#1f2937',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.5'
                    }}
                    labelStyle={{ 
                      color: '#6b7280', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    itemStyle={{ 
                      color: '#111827', 
                      fontSize: '15px', 
                      fontWeight: '800',
                      paddingTop: '2px'
                    }}
                    cursor={{fill: 'rgba(59, 130, 246, 0.08)', radius: '8px'}}
                    wrapperStyle={{ 
                      zIndex: 1000,
                      outline: 'none'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#scoreGradient)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Comparison Chart */}
        <div className="group bg-white dark:bg-[#12121a] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 dark:border-white/5 hover:border-emerald-200/50 dark:hover:border-emerald-500/20 overflow-hidden relative">
          
          {/* Background Decoration */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 flex items-center justify-center border border-emerald-200/30 dark:border-emerald-500/20">
                  <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Department Rankings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Top Performers
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-gradient-to-br from-gray-50/50 to-transparent dark:from-white/[0.02] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.department_comparison} layout="vertical">
                  <defs>
                    <linearGradient id="deptGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[1, 5]} 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="department" 
                    width={110}
                    tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
                      padding: '12px 16px',
                      color: '#1f2937',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.5'
                    }}
                    labelStyle={{ 
                      color: '#6b7280', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    itemStyle={{ 
                      color: '#111827', 
                      fontSize: '15px', 
                      fontWeight: '800',
                      paddingTop: '2px'
                    }}
                    cursor={{fill: 'rgba(16, 185, 129, 0.08)', radius: '8px'}}
                    wrapperStyle={{ 
                      zIndex: 1000,
                      outline: 'none'
                    }}
                  />
                  <Bar 
                    dataKey="avg_score" 
                    fill="url(#deptGradient)" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gender Fairness Pie Chart - Full Width on Large Screens */}
        <div className="lg:col-span-2 group bg-white dark:bg-[#12121a] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 dark:border-white/5 hover:border-purple-200/50 dark:hover:border-purple-500/20 overflow-hidden relative">
          
          {/* Background Decoration */}
          <div className="absolute -left-32 -bottom-32 w-56 h-56 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            
            {/* Chart Header & Visualization */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center border border-purple-200/30 dark:border-purple-500/20">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gender Fairness Analysis</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                    Average Score Distribution
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50/50 to-transparent dark:from-white/[0.02] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={data.gender_fairness}
                      dataKey="avg_score"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      strokeWidth={3}
                      stroke="white"
                    >
                      {data.gender_fairness.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                          strokeOpacity={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)',
                        padding: '12px 16px',
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '600',
                        lineHeight: '1.5'
                      }}
                      labelStyle={{ 
                        color: '#6b7280', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                      itemStyle={{ 
                        color: '#111827', 
                        fontSize: '15px', 
                        fontWeight: '800',
                        paddingTop: '2px'
                      }}
                      wrapperStyle={{ 
                        zIndex: 1000,
                        outline: 'none'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend / Stats Panel */}
            <div className="md:w-72 flex flex-col justify-center space-y-4">
              {data.gender_fairness.map((entry: any, index: number) => (
                <div 
                  key={entry.gender}
                  className="bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.03] dark:to-transparent rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* ✅ FIXED: Using valid CSS instead of invalid ringColor */}
                      <div 
                        className="w-5 h-5 rounded-full shadow-lg" 
                        style={{ 
                          backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length],
                          boxShadow: `0 0 0 3px ${Object.values(COLORS)[index % Object.values(COLORS).length]}33, 0 2px 8px ${Object.values(COLORS)[index % Object.values(COLORS).length]}20`
                        }}
                      />
                      <span className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                        {entry.gender}
                      </span>
                    </div>
                  </div>
                  <div className="pl-7">
                    <span className="text-3xl font-black tabular-nums" style={{ color: Object.values(COLORS)[index % Object.values(COLORS).length] }}>
                      {entry.avg_score.toFixed(3)}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 uppercase tracking-wider">
                      Avg Score • {entry.count} Faculty
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}