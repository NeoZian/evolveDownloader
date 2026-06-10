'use client';
import { useEffect, useState } from 'react';
import FacultyTable from '@/components/FacultyTable';
import ScoreCard from '@/components/ScoreCard';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import { Sparkles, Shield, Brain, BarChart3 } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({ average_score: 0, bias_detected: 0, blockchain_logged: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Hero Section */}
        <div className="mb-14 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse-glow" />
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Intelligent Evaluation System
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Faculty Evaluation{' '}
                <span className="gradient-text">Dashboard</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                AI-Powered analytics with explainable insights and blockchain-secured audit trails for transparent academic evaluations.
              </p>
            </div>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: Brain, label: 'Explainable AI', color: 'purple' },
              { icon: Shield, label: 'Blockchain Secured', color: 'emerald' },
              { icon: BarChart3, label: 'Real-time Analytics', color: 'blue' },
              { icon: Sparkles, label: 'Bias Detection', color: 'amber' }
            ].map((feature, i) => (
              <div 
                key={feature.label}
                className={`group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-semibold text-sm 
                          ${feature.color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/20' : ''}
                          ${feature.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/20' : ''}
                          ${feature.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20' : ''}
                          ${feature.color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/20' : ''}
                          hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <feature.icon className={`w-4 h-4 ${
                  feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  feature.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  'text-amber-600 dark:text-amber-400'
                }`} strokeWidth={2.5} />
                {feature.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14 animate-fade-in-up delay-200">
            <ScoreCard 
              title="Average Score" 
              value={stats.average_score} 
              subtitle="Across all faculty members" 
              color="blue" 
              icon={BarChart3}
            />
            <ScoreCard 
              title="Bias Detected" 
              value={stats.bias_detected} 
              subtitle="Gender parity difference metric" 
              color="amber" 
              icon={Sparkles}
            />
            <ScoreCard 
              title="Evaluations Logged" 
              value={stats.blockchain_logged} 
              subtitle="On private blockchain network" 
              color="emerald" 
              icon={Shield}
            />
          </div>
        )}

        {/* Loading Skeleton for Stats */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-shimmer h-48 rounded-3xl" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}

        {/* Faculty Table Section */}
        <div className="mb-14 animate-fade-in-up delay-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Faculty Directory
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Browse and evaluate faculty performance metrics
              </p>
            </div>
          </div>
          <FacultyTable />
        </div>

        {/* Analytics Charts Section */}
        <AnalyticsCharts />
      </div>
    </div>
  );
}