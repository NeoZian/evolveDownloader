'use client';
import { useEffect, useState, use } from 'react';
import { evaluateFaculty, getExplanation, getAudit } from '@/lib/api';
import XAIExplanation from '@/components/XAIExplanation';
import BlockchainAudit from '@/components/BlockchainAudit';
import { ArrowLeft, ExternalLink, Loader2, Sparkles, Download, User, Award, AlertCircle, CheckCircle2, Rocket, FileText, Shield, Brain, Users } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [data, setData] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loadingLime, setLoadingLime] = useState(false);
  const [limeUrl, setLimeUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const facultyId = Number(id);
      try {
        const evalData = await evaluateFaculty(facultyId);
        setData(evalData);
        const exp = await getExplanation(facultyId);
        setExplanation(exp);
      } catch (err: any) {  // ✅ FIXED: Added ': any' type
        console.error('Failed to load faculty data:', err);
      }

      try {
        const aud = await getAudit(facultyId);
        setAudit(aud);
      } catch (err: any) {  // ✅ FIXED: Added ': any' type
        console.warn('Audit not available');
        setAudit({
          faculty_id: facultyId,
          final_score: 0,
          blockchain_tx_hash: '0xPending',
          result_hash: 'N/A',
          timestamp: new Date().toISOString(),
          status: '⏳ No blockchain record yet'
        });
      }
    };
    load();
  }, [id]);

  /**
   * Open LIME in New Browser Tab (Recommended)
   */
  const openLimeInNewTab = async () => {
    setLoadingLime(true);
    
    try {
      const res = await fetch(`http://localhost:8000/explanation/lime/${id}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      window.open(url, `_lime_${id}`, 'width=1200,height=900,scrollbars=yes,resizable=yes');
      
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
    } catch (err: any) {  // ✅ FIXED: Added ': any' type + safe access
      console.error('LIME Error:', err);
      alert(`LIME generation failed:\n${err?.message || err}\n\nMake sure FastAPI is running on port 8000.`);
    } finally {
      setLoadingLime(false);
    }
  };

  /**
   * Embed LIME in iFrame (Alternative)
   */
  const loadLimeIntoIframe = async () => {
    setLoadingLime(true);
    setLimeUrl(null);
    
    try {
      const res = await fetch(`http://localhost:8000/explanation/lime/${id}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setLimeUrl(url);
      
    } catch (err: any) {  // ✅ FIXED: Added ': any' type + safe access
      console.error('LIME Error:', err);
      alert(`LIME generation failed: ${err?.message || err}. Check terminal and make sure explanations folder exists.`);
    } finally {
      setLoadingLime(false);
    }
  };

  if (!data) return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center pt-28">
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/30 mb-6">
          <User className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Faculty Profile...</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Retrieving evaluation data</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 animate-fade-in-up">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
            <span className="border-b-2 border-blue-600/30 group-hover:border-blue-600/60 transition-colors pb-0.5">
              Back to Dashboard
            </span>
          </Link>
        </div>

        {/* Main Report Card */}
        <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-fade-in-up delay-100">
          
          {/* Header Section with Gradient Background */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 lg:p-12 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Faculty Info */}
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                  <div className="relative w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                    {data.faculty_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-semibold border border-white/20">
                      <Award className="w-4 h-4" strokeWidth={2} />
                      {data.department}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium border border-white/10">
                      ID: #{data.faculty_id}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Score Hero Card */}
              <div className="lg:text-right">
                <div className="inline-block bg-white/10 backdrop-blur-md rounded-3xl p-8 lg:p-10 border border-white/20 shadow-2xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">
                    Final Evaluation Score
                  </p>
                  <div className="text-7xl lg:text-8xl font-black text-white tabular-nums drop-shadow-lg">
                    {data.final_evaluation_score}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold text-white/80">
                      {parseFloat(data.final_evaluation_score) >= 4 ? 'Excellent Performance' : 
                       parseFloat(data.final_evaluation_score) >= 3 ? 'Good Standing' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-12">
            
            {/* Key Factors Grid */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Key Performance Factors</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries({
                  ...data.key_factors,
                  course_quality: data.course_quality_score || 0
                }).map(([key, value]: any, index) => (
                  <div 
                    key={key} 
                    className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.03] dark:to-transparent rounded-2xl p-5 border border-gray-200/60 dark:border-white/5 hover:border-blue-300/60 dark:hover:border-blue-600/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 truncate">
                        {key.replace('_', ' ').replace('rating', 'Feedback').replace('score', 'Score')}
                      </p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                        {Number(value).toFixed(1)}
                      </p>
                      
                      {/* Mini Progress Bar */}
                      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(Number(value) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIME Explanation Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg opacity-60" />
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">LIME Interactive Explanation</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Local Interpretable Model-Agnostic Explanations
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={openLimeInNewTab}
                  disabled={loadingLime}
                  className="group relative inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 hover:from-purple-600 hover:via-purple-700 hover:to-pink-700 
                           text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 
                           disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  {loadingLime ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                      Open LIME in New Tab
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                <button
                  onClick={loadLimeIntoIframe}
                  disabled={loadingLime}
                  className="group relative inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 
                           text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 
                           disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  {loadingLime ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                      Show LIME Here (Embedded)
                    </>
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0 mt-0.5">
                  💡
                </div>
                <div className="text-sm text-blue-800/80 dark:text-blue-300/80 font-medium leading-relaxed">
                  <strong className="text-blue-900 dark:text-blue-200">Method A:</strong> Opens full interactive LIME visualization in a new browser window with all features enabled.<br/>
                  <strong className="text-blue-900 dark:text-blue-200">Method B:</strong> Embeds the LIME visualization directly below (some interactive features may be limited).
                </div>
              </div>

              {/* iFrame Container */}
              {limeUrl && (
                <div className="relative mt-6 border-2 border-emerald-300 dark:border-emerald-600 rounded-3xl overflow-hidden bg-white shadow-2xl shadow-emerald-500/10">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => setLimeUrl(null)}
                      className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close
                    </button>
                  </div>
                  
                  <iframe
                    src={limeUrl}
                    className="w-full h-[720px] border-0 rounded-3xl"
                    title={`LIME Explanation for Faculty ${id}`}
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* XAI Explanation Component */}
            <XAIExplanation explanation={explanation} />

            {/* Actionable Recommendations */}
            <div className="border-t-2 border-gray-100 dark:border-white/5 pt-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl blur-lg opacity-60" />
                  <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-amber-500/25">
                    <Rocket className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Actionable Recommendations</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Personalized improvement suggestions based on evaluation metrics
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.key_factors?.nlp_sentiment < 3 && (
                  <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/10 p-6 rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                        <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-200 text-lg mb-2">
                          Improve Clarity in Explanations
                        </h3>
                        <p className="text-amber-800/70 dark:text-amber-400/70 font-medium leading-relaxed text-sm">
                          Student comments and NLP topic modeling indicate confusion in course material delivery. Consider adding more concrete examples, visual aids, and summary recaps during lectures.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {data.key_factors?.student_feedback < 3.5 && (
                  <div className="group relative bg-gradient-to-br from-amber-50 to-yellow-50/30 dark:from-amber-950/30 dark:to-yellow-950/10 p-6 rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-200 text-lg mb-2">
                          Boost Student Engagement
                        </h3>
                        <p className="text-amber-800/70 dark:text-amber-400/70 font-medium leading-relaxed text-sm">
                          Low feedback rating detected. Consider implementing more interactive activities, increasing office hour availability, and creating more opportunities for student participation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {data.key_factors?.peer_review < 3.5 && (
                  <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/10 p-6 rounded-2xl border-2 border-amber-200/60 dark:border-amber-800/30 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
                        <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />  {/* ✅ Now works! */}
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-200 text-lg mb-2">
                          Peer Observation Session
                        </h3>
                        <p className="text-amber-800/70 dark:text-amber-400/70 font-medium leading-relaxed text-sm">
                          Peer review score is below departmental average. Scheduling a peer teaching observation session could provide valuable insights into pedagogical improvement opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {data.final_evaluation_score > 4.2 && (
                  <div className="md:col-span-2 group relative bg-gradient-to-br from-emerald-50 via-white to-green-50/30 dark:from-emerald-950/30 dark:via-[#12121a] dark:to-green-950/10 p-8 rounded-2xl border-2 border-emerald-200/60 dark:border-emerald-800/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-5">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 flex-shrink-0">
                        <Rocket className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-2xl mb-3">
                          🎉 Exceptional Performance!
                        </h3>
                        <p className="text-emerald-800/70 dark:text-emerald-400/70 font-medium leading-relaxed text-base">
                          Outstanding evaluation results across all metrics. Continue current best practices and consider mentoring junior faculty members or leading departmental initiatives. This level of excellence serves as a model for academic excellence.
                        </p>
                        
                        <div className="mt-5 flex flex-wrap gap-3">
                          <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-sm border border-emerald-200/50 dark:border-emerald-800/30">
                            Top Performer
                          </span>
                          <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-sm border border-emerald-200/50 dark:border-emerald-800/30">
                            Mentorship Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Audit Component */}
            <BlockchainAudit audit={audit} />

            {/* PDF Download Section */}
            <div className="border-t-2 border-gray-100 dark:border-white/5 pt-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl blur-lg opacity-60" />
                  <div className="relative bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg shadow-red-500/25">
                    <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Export Audit Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    Download complete evaluation record as PDF document
                  </p>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:8000/export_pdf/${id}`);
                    if (!res.ok) {
                      const errorText = await res.text();
                      throw new Error(`Server error: ${res.status} - ${errorText}`);
                    }
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audit_report_${id}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err: any) {  // ✅ FIXED: Proper error typing
                    console.error('PDF Error:', err);
                    alert(`PDF download failed:\n${err?.message || err}\n\nMake sure FastAPI is running on port 8000.`);
                  }
                }}
                className="group relative inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700 
                         text-white font-bold text-base rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/35 
                         transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
                Download Complete Audit PDF
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}