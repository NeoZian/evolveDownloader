import { ShieldCheck, Clock, Hash, Lock, CheckCircle2 } from 'lucide-react';

export default function BlockchainAudit({ audit }: { audit: any }) {
  if (!audit) return null;

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-white/10 pt-12">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl blur-lg opacity-60 animate-pulse-glow" />
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Blockchain Audit Trail
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            Immutable verification on distributed ledger
          </p>
        </div>
      </div>
      
      {/* Main Audit Card with Security Theme */}
      <div className="relative bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-[#0a1512] dark:via-[#12121a] dark:to-emerald-950/20 rounded-3xl p-8 md:p-10 border-2 border-emerald-200/60 dark:border-emerald-800/30 shadow-xl shadow-emerald-500/10 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Transaction Hash Card */}
          <div className="group space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 flex items-center justify-center border border-emerald-200/40 dark:border-emerald-700/30 group-hover:from-emerald-500/20 group-hover:to-emerald-600/20 transition-colors duration-300">
                <Hash className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Transaction Hash</h4>
                <p className="text-xs text-emerald-600/60 dark:text-emerald-500/60 font-medium">Unique Identifier</p>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/60 dark:border-emerald-800/20 group-hover:border-emerald-300/60 dark:group-hover:border-emerald-700/30 transition-colors duration-300">
              <p className="font-mono text-xs leading-relaxed break-all text-gray-700 dark:text-gray-300 font-semibold select-all cursor-text hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                {audit.blockchain_tx_hash}
              </p>
            </div>
            
            <button 
              onClick={() => navigator.clipboard.writeText(audit.blockchain_tx_hash)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Click to copy hash
            </button>
          </div>
          
          {/* Timestamp Card */}
          <div className="group space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/40 dark:border-blue-700/30 group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-colors duration-300">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-blue-800 dark:text-blue-300">Timestamp</h4>
                <p className="text-xs text-blue-600/60 dark:text-blue-500/60 font-medium">Recorded At</p>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-blue-100/60 dark:border-blue-800/20 group-hover:border-blue-300/60 dark:group-hover:border-blue-700/30 transition-colors duration-300">
              <p className="text-gray-800 dark:text-gray-200 font-semibold text-base">
                {new Date(audit.timestamp).toLocaleString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              UTC Timezone • Immutable Record
            </div>
          </div>
          
          {/* Verification Status Card */}
          <div className="group space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Verification</h4>
                <p className="text-xs text-emerald-600/60 dark:text-emerald-500/60 font-medium">Security Status</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-300/50 dark:border-emerald-600/30 text-center group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-4 h-4" />
                Tamper-proof & Immutable
              </div>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 font-semibold mt-3 uppercase tracking-wider">
                Verified on Private Blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="mt-6 flex items-start gap-3 px-2">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          This evaluation record is permanently stored on a private Ethereum blockchain (Ganache network). 
          The transaction hash serves as cryptographic proof of authenticity and cannot be altered or deleted.
        </p>
      </div>
    </div>
  );
}