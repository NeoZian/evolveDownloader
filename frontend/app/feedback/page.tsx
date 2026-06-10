'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, CheckCircle, Star, Eye, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const [facultyId, setFacultyId] = useState('');
  const [understandability, setUnderstandability] = useState(3);
  const [trust, setTrust] = useState(3);
  const [comment, setComment] = useState('');
  const [xaiViewed, setXaiViewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: parseInt(facultyId),
          understandability_score: understandability,
          trust_score: trust,
          comment: comment || null,
          xai_viewed: xaiViewed
        })
      });
      
      if (!res.ok) throw new Error('Submission failed');
      
      setMessageType('success');
      setMessage('✅ Thank you for your valuable feedback! Your response helps us improve.');
      setFacultyId('');
      setUnderstandability(3);
      setTrust(3);
      setComment('');
      setXaiViewed(false);
    } catch (err) {
      setMessageType('error');
      setMessage('❌ Error submitting feedback. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-5 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl blur-lg opacity-60" />
              <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-violet-500/25">
                <MessageSquare className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Faculty Feedback
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Your insights help us build a fairer, more transparent evaluation system
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="animate-fade-in-up delay-200">
          <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
            
            {/* Form Header */}
            <div className="px-8 lg:px-10 py-6 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/50 dark:from-violet-950/20 dark:via-[#12121a] dark:to-purple-950/10 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
                <span className="text-sm font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Submit Your Evaluation Feedback
                </span>
              </div>
            </div>

            <div className="p-8 lg:p-10 space-y-8">
              
              {/* Faculty ID Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <span className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs font-black">
                    1
                  </span>
                  Faculty ID
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    required
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    placeholder="Enter your unique faculty identification number..."
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-white/20"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-focus-within:bg-violet-200 dark:group-focus-within:bg-violet-800/50 transition-colors duration-200">
                    <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">#</span>
                  </div>
                </div>
              </div>

              {/* Understandability Rating */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black">
                    2
                  </span>
                  How understandable was the AI evaluation?
                  <span className="ml-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-xs font-normal normal-case">
                    1 = Confusing → 5 = Very Clear
                  </span>
                </label>
                
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUnderstandability(value)}
                      className={`group relative flex-1 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        understandability === value
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800/30'
                      }`}
                    >
                      <span className="relative z-10">{value}</span>
                      
                      {/* Hover Label */}
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                        value === 1 ? 'bg-red-100 text-red-700' :
                        value === 2 ? 'bg-orange-100 text-orange-700' :
                        value === 3 ? 'bg-yellow-100 text-yellow-700' :
                        value === 4 ? 'bg-lime-100 text-lime-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {value === 1 ? 'Very Confusing' : value === 2 ? 'Confusing' : value === 3 ? 'Neutral' : value === 4 ? 'Clear' : 'Crystal Clear'}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span>😕 Very Confusing</span>
                  <span>🤔 Neutral</span>
                  <span>✨ Crystal Clear</span>
                </div>
              </div>

              {/* Trust Rating */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    3
                  </span>
                  How much do you trust this AI evaluation system?
                  <span className="ml-2 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-normal normal-case">
                    1 = No Trust → 5 = Complete Trust
                  </span>
                </label>
                
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTrust(value)}
                      className={`group relative flex-1 py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        trust === value
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30'
                      }`}
                    >
                      <span className="relative z-10">{value}</span>
                      
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                        value === 1 ? 'bg-red-100 text-red-700' :
                        value === 2 ? 'bg-orange-100 text-orange-700' :
                        value === 3 ? 'bg-yellow-100 text-yellow-700' :
                        value === 4 ? 'bg-lime-100 text-lime-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {value === 1 ? 'Distrust' : value === 2 ? 'Skeptical' : value === 3 ? 'Neutral' : value === 4 ? 'Trusting' : 'Full Confidence'}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span><ThumbsDown className="w-4 h-4 inline mr-1" /> No Trust</span>
                  <span>⚖️ Neutral</span>
                  <span><ThumbsUp className="w-4 h-4 inline mr-1" /> Full Trust</span>
                </div>
              </div>

              {/* Comments Textarea */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-black">
                    4
                  </span>
                  Additional Comments
                  <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your suggestions, concerns, or any feedback about the evaluation process..."
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-gray-200 dark:border-white/10 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-all duration-200 hover:border-gray-300 dark:hover:border-white/20"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {comment.length} characters
                  </span>
                </div>
              </div>

              {/* XAI Viewed Checkbox */}
              <div className="relative">
                <label className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50/80 via-white to-violet-50/50 dark:from-purple-950/20 dark:via-[#12121a] dark:to-violet-950/10 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/20 cursor-pointer group hover:border-purple-400/50 dark:hover:border-purple-600/40 transition-all duration-300">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="xaiViewed"
                      checked={xaiViewed}
                      onChange={(e) => setXaiViewed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 peer-checked:bg-gradient-to-br peer-checked:from-purple-500 peer-checked:to-violet-600 peer-checked:border-transparent transition-all duration-300 flex items-center justify-center peer-checked:shadow-lg peer-checked:shadow-purple-500/25">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-white opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-all duration-300" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                      <span className="font-bold text-gray-900 dark:text-white">
                        I viewed the XAI explanation (SHAP/LIME) before giving feedback
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-7">
                      This helps us understand how explainable AI affects user trust and comprehension
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700 
                           text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/35 
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {submitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
                        Submitting Feedback...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
                        Submit Feedback
                      </>
                    )}
                  </span>
                  
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`p-5 rounded-2xl border-2 animate-fade-in-up ${
                  messageType === 'success' 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/10 border-emerald-200/60 dark:border-emerald-800/30' 
                    : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/10 border-red-200/60 dark:border-red-800/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${messageType === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                      {messageType === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                      )}
                    </div>
                    <p className={`font-semibold ${messageType === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'} leading-relaxed`}>
                      {message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}