'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, BarChart3, Play, AlertTriangle, TrendingUp, Users, Scale } from 'lucide-react';

interface FairnessReport {
  timestamp: string;
  threshold: number;
  score_threshold: number;
  bias_alert: boolean;
  alert_message: string;
  fairness_metrics: {
    demographic_parity_difference: number;
    demographic_parity_ratio: number;
    equalized_odds_difference: number;
    mean_score_by_gender: Record<string, number>;
    count_by_gender: Record<string, number>;
  };
  injected_bias_analysis: {
    bias_detected: boolean;
    message: string;
    target_group_mean_peer: number;
    control_group_mean_peer: number;
    difference: number;
  };
  plot_path: string;
}

export default function FairnessPage() {
  const [report, setReport] = useState<FairnessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestReport = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/fairness/latest');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setError(null);
      } else if (res.status === 404) {
        setError('No fairness report found. Click "Run Fairness Audit" to generate one.');
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

  const runFairnessAudit = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/fairness/run', {
        method: 'POST',
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Fairness audit failed');
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error running fairness audit');
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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-60" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-blue-500/25">
                  <BarChart3 className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Fairness & Bias Audit
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  Comprehensive analysis of algorithmic fairness across demographic groups
                </p>
              </div>
            </div>

            {/* Run Audit Button */}
            <button
              onClick={runFairnessAudit}
              disabled={running}
              className="group relative inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 
                       disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              {running ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  Run Fairness Audit
                </>
              )}
            </button>
          </div>
          
          {/* Timestamp */}
          {report && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <Scale className="w-4 h-4" strokeWidth={2} />
              Last updated: {new Date(report.timestamp).toLocaleString()}
            </div>
          )}
        </div>

        {error && !report && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 border-l-4 border-red-500 rounded-2xl shadow-lg animate-fade-in-up">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-300 text-lg">No Data Available</h3>
                <p className="text-red-700/80 dark:text-red-400/80 mt-1 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && (
          <>
            {/* Alert Banner */}
            <div className={`mb-10 p-6 rounded-2xl border-l-[6px] shadow-lg animate-fade-in-up ${
              report.bias_alert 
                ? 'bg-gradient-to-r from-red-50 via-white to-red-50/30 dark:from-red-950/30 dark:via-[#12121a] dark:to-red-950/10 border-red-500' 
                : 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-[#12121a] dark:to-emerald-950/10 border-emerald-500'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${report.bias_alert ? 'bg-red-100 dark:bg-red-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}>
                  {report.bias_alert ? (
                    <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                  ) : (
                    <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-1 ${report.bias_alert ? 'text-red-800 dark:text-red-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                    {report.bias_alert ? '⚠️ Bias Detected!' : '✅ No Bias Detected'}
                  </h3>
                  <p className={`${report.bias_alert ? 'text-red-700/80 dark:text-red-400/80' : 'text-emerald-700/80 dark:text-emerald-400/80'} font-medium leading-relaxed`}>
                    {report.alert_message}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider ${
                  report.bias_alert 
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-800/30' 
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30'
                }`}>
                  {report.bias_alert ? 'Action Required' : 'All Clear'}
                </div>
              </div>
            </div>

            {/* Fairness Metrics Cards */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Fairness Metrics</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Demographic Parity Difference */}
                <div className={`group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden ${
                  report.fairness_metrics.demographic_parity_difference > report.threshold 
                    ? 'border-red-200/60 dark:border-red-800/30 hover:border-red-400/50' 
                    : 'border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400/50'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    report.fairness_metrics.demographic_parity_difference > report.threshold 
                      ? 'from-red-500/5 via-transparent to-red-500/5' 
                      : 'from-emerald-500/5 via-transparent to-emerald-500/5'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Demographic Parity Diff
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.fairness_metrics.demographic_parity_difference > report.threshold 
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        Threshold: {report.threshold}
                      </div>
                    </div>
                    
                    <div className={`text-5xl font-black tabular-nums mb-2 ${
                      report.fairness_metrics.demographic_parity_difference > report.threshold 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {report.fairness_metrics.demographic_parity_difference}
                    </div>
                    
                    <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          report.fairness_metrics.demographic_parity_difference > report.threshold 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-500'
                        }`}
                        style={{ width: `${Math.min(report.fairness_metrics.demographic_parity_difference / (report.threshold * 2) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Demographic Parity Ratio */}
                <div className={`group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden ${
                  report.fairness_metrics.demographic_parity_ratio < 0.8 
                    ? 'border-red-200/60 dark:border-red-800/30 hover:border-red-400/50' 
                    : 'border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400/50'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    report.fairness_metrics.demographic_parity_ratio < 0.8 
                      ? 'from-red-500/5 via-transparent to-red-500/5' 
                      : 'from-emerald-500/5 via-transparent to-emerald-500/5'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Demographic Parity Ratio
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.fairness_metrics.demographic_parity_ratio < 0.8 
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        Target: {'>'} 0.8
                      </div>
                    </div>
                    
                    <div className={`text-5xl font-black tabular-nums mb-2 ${
                      report.fairness_metrics.demographic_parity_ratio < 0.8 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {report.fairness_metrics.demographic_parity_ratio}
                    </div>
                    
                    <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          report.fairness_metrics.demographic_parity_ratio < 0.8 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 w-1/4' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-500'
                        }`}
                        style={{ width: `${(report.fairness_metrics.demographic_parity_ratio / 1.5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Equalized Odds Difference */}
                <div className={`group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden ${
                  report.fairness_metrics.equalized_odds_difference > report.threshold 
                    ? 'border-red-200/60 dark:border-red-800/30 hover:border-red-400/50' 
                    : 'border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400/50'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    report.fairness_metrics.equalized_odds_difference > report.threshold 
                      ? 'from-red-500/5 via-transparent to-red-500/5' 
                      : 'from-emerald-500/5 via-transparent to-emerald-500/5'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Equalized Odds Diff
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.fairness_metrics.equalized_odds_difference > report.threshold 
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        Threshold: {report.threshold}
                      </div>
                    </div>
                    
                    <div className={`text-5xl font-black tabular-nums mb-2 ${
                      report.fairness_metrics.equalized_odds_difference > report.threshold 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {report.fairness_metrics.equalized_odds_difference}
                    </div>
                    
                    <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          report.fairness_metrics.equalized_odds_difference > report.threshold 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-500'
                        }`}
                        style={{ width: `${Math.min(report.fairness_metrics.equalized_odds_difference / (report.threshold * 2) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gender Score Comparison */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Mean Scores by Gender</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {Object.entries(report.fairness_metrics.mean_score_by_gender).map(([gender, score], index) => (
                  <div 
                    key={gender} 
                    className="group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-purple-200/60 dark:border-purple-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/40 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center border border-purple-200/40 dark:border-purple-700/30 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{gender}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Demographic Group</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Average Score</span>
                            <span className="text-5xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                              {score.toFixed(3)}
                            </span>
                          </div>
                          
                          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Faculty Count</span>
                          <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold text-sm">
                            {report.fairness_metrics.count_by_gender[gender]} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Injected Bias Analysis */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Injected Bias Detection</h2>
              </div>
              
              <div className="bg-white dark:bg-[#12121a] rounded-3xl p-8 lg:p-10 border-2 border-amber-200/60 dark:border-amber-800/30 shadow-lg">
                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-8 leading-relaxed">
                  {report.injected_bias_analysis.message}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Target Group */}
                  <div className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-transparent rounded-2xl p-6 border border-rose-200/50 dark:border-rose-800/20 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3">
                      Female (CS/Eng)
                    </p>
                    <p className="text-4xl font-black text-rose-700 dark:text-rose-300 tabular-nums">
                      {report.injected_bias_analysis.target_group_mean_peer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">Peer Score Avg</p>
                  </div>
                  
                  {/* Control Group */}
                  <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-transparent rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/20 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                      Male (CS/Eng)
                    </p>
                    <p className="text-4xl font-black text-blue-700 dark:text-blue-300 tabular-nums">
                      {report.injected_bias_analysis.control_group_mean_peer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">Peer Score Avg</p>
                  </div>
                  
                  {/* Difference */}
                  <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-transparent rounded-2xl p-6 border border-red-200/50 dark:border-red-800/20 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
                      Difference
                    </p>
                    <p className="text-4xl font-black text-red-700 dark:text-red-300 tabular-nums">
                      {report.injected_bias_analysis.difference}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">Score Gap</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization */}
            {report.plot_path && (
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Visualizations</h2>
                </div>
                
                <div className="bg-white dark:bg-[#12121a] rounded-3xl p-8 border-2 border-indigo-200/60 dark:border-indigo-800/30 shadow-lg overflow-hidden">
                  <img 
                    src={`http://localhost:8000/reports/${report.plot_path.split('/').pop()}`} 
                    alt="Fairness visualization charts" 
                    className="w-full rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}