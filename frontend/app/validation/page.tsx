'use client';
import { useEffect, useState } from 'react';
import { LineChart, AlertTriangle, CheckCircle, Play, FlaskConical, TrendingUp, GitCompare, Users } from 'lucide-react';

interface ValidationReport {
  timestamp: string;
  parallel_run_mode: boolean;
  comparison_metrics: {
    pearson_correlation: number;
    p_value: number;
    rmse: number;
    mae: number;
  };
  statistical_tests: {
    variance_traditional: number;
    variance_ai: number;
    variance_ratio_traditional_over_ai: number;
    levene_statistic: number;
    levene_p_value: number;
    paired_ttest_statistic: number;
    paired_ttest_p_value: number;
    interpretation: string;
  };
  flagged_faculty_count: number;
  flagged_faculty_sample: any[];
  plot_path: string;
  human_expert_simulation?: {
    average_inter_rater_correlation: number;
    correlation_avg_human_vs_ai: number;
  };
}

export default function ValidationPage() {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestReport = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/validation/latest');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setError(null);
      } else if (res.status === 404) {
        setError('No validation report found. Click "Run Validation" to generate one.');
      } else {
        throw new Error('Failed to load report');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend. Make sure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  const runValidation = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/validation/run', {
        method: 'POST',
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Validation failed');
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error running validation');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  if (loading) return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center pt-28">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 w-full space-y-8 animate-fade-in-up">
        <div className="animate-shimmer h-16 w-96 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-shimmer h-48 rounded-2xl" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl blur-lg opacity-60" />
                <div className="relative bg-gradient-to-br from-cyan-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-cyan-500/25">
                  <LineChart className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Validation & Hypothesis Testing
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  Statistical comparison between AI-powered and traditional evaluation methods
                </p>
              </div>
            </div>

            {/* Run Validation Button */}
            <button
              onClick={runValidation}
              disabled={running}
              className="group relative inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 
                       text-white font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35 
                       disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              {running ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  Run Validation Suite
                </>
              )}
            </button>
          </div>
          
          {report && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <LineChart className="w-4 h-4" strokeWidth={2} />
              Last validated: {new Date(report.timestamp).toLocaleString()}
            </div>
          )}
        </div>

        {error && !report && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-l-4 border-amber-500 rounded-2xl shadow-lg animate-fade-in-up">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg">No Validation Data</h3>
                <p className="text-amber-700/80 dark:text-amber-400/80 mt-1 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && (
          <>
            {/* Parallel Run Mode Banner */}
            <div className={`mb-10 p-6 rounded-2xl border-l-[6px] shadow-lg animate-fade-in-up ${
              report.parallel_run_mode 
                ? 'bg-gradient-to-r from-blue-50 via-white to-cyan-50/30 dark:from-blue-950/30 dark:via-[#12121a] dark:to-cyan-950/10 border-blue-500' 
                : 'bg-gradient-to-r from-amber-50 via-white to-yellow-50/30 dark:from-amber-950/30 dark:via-[#12121a] dark:to-yellow-950/10 border-amber-500'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${report.parallel_run_mode ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                  {report.parallel_run_mode ? (
                    <CheckCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">
                    Parallel Run Mode: {report.parallel_run_mode ? '✅ ACTIVE' : '⚠️ INACTIVE'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {report.parallel_run_mode 
                      ? 'AI scores are for validation only and not used for real decisions.' 
                      : 'AI scores could be used for real decisions (not recommended for production).'}
                  </p>
                </div>
                <div className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                  report.parallel_run_mode 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30' 
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/30'
                }`}>
                  {report.parallel_run_mode ? 'Safe Mode' : 'Caution'}
                </div>
              </div>
            </div>

            {/* Comparison Metrics Cards */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Comparison Metrics</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Pearson Correlation */}
                <div className="group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-cyan-200/60 dark:border-cyan-800/30 hover:border-cyan-400/50 dark:hover:border-cyan-600/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 flex items-center justify-center border border-cyan-200/40 dark:border-cyan-700/30">
                        <GitCompare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Pearson Correlation
                      </span>
                    </div>
                    
                    <div className="text-5xl font-black text-cyan-600 dark:text-cyan-400 tabular-nums mb-2">
                      {report.comparison_metrics.pearson_correlation}
                    </div>
                    
                    <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                        p-value: {report.comparison_metrics.p_value}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RMSE */}
                <div className="group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-violet-200/60 dark:border-violet-800/30 hover:border-violet-400/50 dark:hover:border-violet-600/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 flex items-center justify-center border border-violet-200/40 dark:border-violet-700/30">
                        <LineChart className="w-5 h-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        RMSE
                      </span>
                    </div>
                    
                    <div className="text-5xl font-black text-violet-600 dark:text-violet-400 tabular-nums mb-2">
                      {report.comparison_metrics.rmse}
                    </div>
                    
                    <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                      <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                        Root Mean Square Error
                      </p>
                    </div>
                  </div>
                </div>

                {/* MAE */}
                <div className="group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-rose-200/60 dark:border-rose-800/30 hover:border-rose-400/50 dark:hover:border-rose-600/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/10 flex items-center justify-center border border-rose-200/40 dark:border-rose-700/30">
                        <LineChart className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        MAE
                      </span>
                    </div>
                    
                    <div className="text-5xl font-black text-rose-600 dark:text-rose-400 tabular-nums mb-2">
                      {report.comparison_metrics.mae}
                    </div>
                    
                    <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                        Mean Absolute Error
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hypothesis Test Result */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <FlaskConical className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">H1 Hypothesis Test Result</h2>
              </div>
              
              <div className={`p-8 lg:p-10 rounded-3xl border-l-[6px] shadow-lg ${
                report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional 
                  ? 'bg-gradient-to-r from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/30 dark:via-[#12121a] dark:to-teal-950/10 border-emerald-500' 
                  : 'bg-gradient-to-r from-red-50 via-white to-rose-50/30 dark:from-red-950/30 dark:via-[#12121a] dark:to-rose-950/10 border-red-500'
              }`}>
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl ${
                    report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40' 
                      : 'bg-red-100 dark:bg-red-900/40'
                  }`}>
                    {report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional ? (
                      <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    ) : (
                      <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" strokeWidth={2} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-3 ${
                      report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional 
                        ? 'text-emerald-800 dark:text-emerald-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      H1 Verdict: AI is{' '}
                      <span className="underline decoration-2 underline-offset-4">
                        {report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional ? 'MORE' : 'LESS'}
                      </span>{' '}
                      reliable than traditional methods
                    </h3>
                    
                    <p className={`text-lg leading-relaxed font-medium mb-6 ${
                      report.statistical_tests.variance_ai < report.statistical_tests.variance_traditional 
                        ? 'text-emerald-700/80 dark:text-emerald-400/80' 
                        : 'text-red-700/80 dark:text-red-400/80'
                    }`}>
                      {report.statistical_tests.interpretation}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Variance (Traditional)', value: report.statistical_tests.variance_traditional },
                        { label: 'Variance (AI)', value: report.statistical_tests.variance_ai },
                        { label: 'Variance Ratio', value: report.statistical_tests.variance_ratio_traditional_over_ai },
                        { label: "Levene's p-value", value: report.statistical_tests.levene_p_value }
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-white/5">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 truncate">
                            {stat.label}
                          </p>
                          <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                            {typeof stat.value === 'number' ? stat.value.toFixed(4) : stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Human Expert Simulation (if available) */}
            {report.human_expert_simulation && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Human Expert Comparison (Simulated)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-purple-200/60 dark:border-purple-800/30 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Inter-Rater Correlation
                      </span>
                    </div>
                    <div className="text-5xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                      {report.human_expert_simulation.average_inter_rater_correlation}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
                      Agreement among human evaluators
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-indigo-200/60 dark:border-indigo-800/30 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <GitCompare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        AI vs Human Correlation
                      </span>
                    </div>
                    <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {report.human_expert_simulation.correlation_avg_human_vs_ai}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
                      Alignment between AI and human judgments
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flagged Faculty Table */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Flagged Faculty for Review</h2>
              </div>
              
              <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Significant Discrepancies (|AI - Traditional| {'>'} 0.5)
                    </h3>
                    <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full font-bold text-sm">
                      {report.flagged_faculty_count} flagged
                    </span>
                  </div>
                </div>
                
                {report.flagged_faculty_sample.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-white/[0.02]">
                          <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                          <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                          <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                          <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Traditional</th>
                          <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">AI Score</th>
                          <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {report.flagged_faculty_sample.map((faculty, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/30 dark:hover:amber-900/10 transition-colors">
                            <td className="px-8 py-4 font-bold text-gray-900 dark:text-white">#{faculty.faculty_id}</td>
                            <td className="px-8 py-4 font-semibold text-gray-800 dark:text-gray-200">{faculty.faculty_name}</td>
                            <td className="px-8 py-4 text-gray-600 dark:text-gray-400">{faculty.department}</td>
                            <td className="px-8 py-4 text-center font-mono font-bold text-gray-700 dark:text-gray-300">{faculty.traditional_score}</td>
                            <td className="px-8 py-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{faculty.final_evaluation_score}</td>
                            <td className="px-8 py-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-black text-sm border border-red-200/50 dark:border-red-800/30">
                                {faculty.difference}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30">
                      <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        Excellent! No flagged faculty — AI and traditional scores align well.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualization */}
            {report.plot_path && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <LineChart className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Statistical Visualizations</h2>
                </div>
                
                <div className="bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-teal-200/60 dark:border-teal-800/30 shadow-lg overflow-hidden">
                  <img 
                    src={`http://localhost:8000/reports/${report.plot_path.split('/').pop()}`} 
                    alt="Validation statistical plots" 
                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner"
                  />
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 font-medium">
                    Generated on {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}