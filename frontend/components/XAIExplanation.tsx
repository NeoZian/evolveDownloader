export default function XAIExplanation({ explanation }: { explanation: any }) {
  if (!explanation) return null;

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-white/10 pt-12">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-60" />
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-blue-500/25">
            <span className="text-2xl">🧠</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Explainable AI Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            Understanding the factors behind this evaluation score
          </p>
        </div>
      </div>
      
      {/* Split Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Positive Factors Panel */}
        <div className="group relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-[#12121a] dark:to-emerald-950/20 rounded-3xl p-8 border-2 border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-600/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden">
          
          {/* Background Decoration */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/15 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Positive Contributors</h4>
                <p className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider mt-0.5">
                  Strengths & Achievements
                </p>
              </div>
              <div className="ml-auto px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {explanation.top_positive_factors?.length || 0} Factors
              </div>
            </div>

            {/* Factors List */}
            <div className="space-y-3">
              {explanation.top_positive_factors?.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className="group/factor flex items-center justify-between p-4 bg-white/70 dark:bg-white/[0.03] rounded-2xl border border-emerald-100/80 dark:border-emerald-800/20 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                      {item.feature.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{item.contribution}
                    </span>
                    <div className="w-16 h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                        style={{ width: `${Math.min(Math.abs(item.contribution) * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!explanation.top_positive_factors || explanation.top_positive_factors.length === 0) && (
                <div className="text-center py-8 text-emerald-600/60 dark:text-emerald-500/60 font-medium">
                  No positive factors identified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Negative Factors Panel */}
        <div className="group relative bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-[#12121a] dark:to-amber-950/20 rounded-3xl p-8 border-2 border-amber-200/60 dark:border-amber-800/30 hover:border-amber-400/50 dark:hover:border-amber-600/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden">
          
          {/* Background Decoration */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/15 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-amber-800 dark:text-amber-300">Areas for Improvement</h4>
                <p className="text-xs font-semibold text-amber-600/70 dark:text-amber-500/70 uppercase tracking-wider mt-0.5">
                  Growth Opportunities
                </p>
              </div>
              <div className="ml-auto px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                {explanation.top_negative_factors?.length || 0} Factors
              </div>
            </div>

            {/* Factors List */}
            <div className="space-y-3">
              {explanation.top_negative_factors?.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className="group/factor flex items-center justify-between p-4 bg-white/70 dark:bg-white/[0.03] rounded-2xl border border-amber-100/80 dark:border-amber-800/20 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 text-sm">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                      {item.feature?.replace('_', ' ') || item.feature}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      {item.contribution}
                    </span>
                    <div className="w-16 h-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(Math.abs(item.contribution) * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!explanation.top_negative_factors || explanation.top_negative_factors.length === 0) && (
                <div className="text-center py-8 text-amber-600/60 dark:text-amber-500/60 font-medium">
                  No negative factors identified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Explanation Callout Box */}
      <div className="relative bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:from-[#12121a] dark:via-[#12121a] dark:to-purple-950/20 rounded-3xl p-8 border-2 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
        <div className="absolute top-0 left-8 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
          AI Summary
        </div>
        <div className="pt-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-base">
            {explanation.full_explanation}
          </p>
        </div>
      </div>
    </div>
  );
}