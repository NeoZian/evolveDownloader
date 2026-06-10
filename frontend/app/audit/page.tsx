'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Hash, Clock, FileText, AlertCircle } from 'lucide-react';

export default function AuditPage() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/audit/all?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (err) {
      console.error('Audit fetch error:', err);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit(page);
  }, [page]);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl blur-lg opacity-60" />
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/25">
                <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Blockchain Audit Trail
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Complete immutable record of all evaluation transactions on the distributed ledger
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-full">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Network Active • Ganache Local
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-4 animate-fade-in-up">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-shimmer h-24 rounded-2xl" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : (
          <>
            {/* Transactions Container */}
            <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden animate-fade-in-up">
              
              {/* Table Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-white/[0.02]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Transaction Records
                  </h2>
                  <span className="ml-auto text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Page {page} of {totalPages} • {transactions.length} records
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-white/[0.02]">
                      <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" strokeWidth={2} />
                          Faculty ID
                        </div>
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Final Score
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" strokeWidth={2} />
                          Transaction Hash
                        </div>
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" strokeWidth={2} />
                          Timestamp
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {transactions.map((tx: any, index: number) => (
                      <tr 
                        key={`${tx.faculty_id}-${index}`} 
                        className="group hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent dark:hover:from-emerald-500/5 transition-all duration-200"
                      >
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center justify-center min-w-[80px] px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400 font-bold text-sm rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                            #{tx.faculty_id}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-lg font-black tabular-nums px-4 py-1.5 rounded-lg font-mono
                            ${parseFloat(tx.final_score) >= 4 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 
                              parseFloat(tx.final_score) >= 3 ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 
                              'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'}`}>
                            {tx.final_score}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <code className="block font-mono text-xs bg-gray-900 dark:bg-gray-950 text-emerald-400 px-4 py-2.5 rounded-xl border border-gray-800 dark:border-gray-700 max-w-md truncate hover:max-w-none transition-all duration-300 cursor-pointer select-all">
                            {tx.blockchain_tx_hash}
                          </code>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                              <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                No transactions found
                              </p>
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Blockchain audit trail is empty or still syncing
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/30 to-transparent dark:from-white/[0.01]">
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 
                           hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 
                           rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white 
                           bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 
                           rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 
                           disabled:opacity-40 disabled:shadow-none transition-all duration-200 hover:-translate-y-0.5"
                >
                  Next
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}