'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPaginatedFaculties } from '@/lib/api';
import { ChevronLeft, ChevronRight, Search, User, ArrowUpRight, Filter } from 'lucide-react';

export default function FacultyTable() {
  const [data, setData] = useState<any>({ faculties: [], pagination: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');

  const loadPage = async (page: number, resetPage?: boolean) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (search.trim()) filters.search = search.trim();
      if (minScore !== '') filters.min_score = parseFloat(minScore);
      if (maxScore !== '') filters.max_score = parseFloat(maxScore);

      const result = await getPaginatedFaculties(page, 15, filters);
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reload when filters change (reset to page 1)
  useEffect(() => {
    loadPage(1);
  }, [search, minScore, maxScore]);

  const { faculties, pagination } = data;

  // Premium Loading Skeleton with Shimmer Effect
  if (loading && !faculties?.length) {
    return (
      <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-white/5">
        {/* Header Skeleton */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="animate-shimmer h-7 w-48 rounded-lg" />
            <div className="animate-shimmer h-9 w-64 rounded-xl" />
          </div>
        </div>
        
        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-100 dark:divide-white/5 p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-shimmer h-20 rounded-2xl" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#12121a] rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-xl transition-shadow duration-300">
      
      {/* Premium Filter Bar */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/80 via-gray-50/40 to-transparent dark:from-white/[0.02] dark:via-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          
          {/* Search Input with Icon */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search faculty by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl 
                       focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none 
                       text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 
                       transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          {/* Score Range Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400 hidden lg:block" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:block">Score</span>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Min"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="w-24 px-4 py-2.5 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-lg 
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none 
                         text-sm font-semibold text-center transition-all duration-200 hover:border-gray-300"
              />
              
              <span className="text-gray-300 dark:text-gray-600 font-light">—</span>
              
              <input
                type="number"
                step="0.1"
                placeholder="Max"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-24 px-4 py-2.5 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-lg 
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none 
                         text-sm font-semibold text-center transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          {/* Results Count Badge */}
          <div className="lg:ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-full">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Page {currentPage} of {pagination.total_pages || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-white/[0.02]">
              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Faculty Member
              </th>
              <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Department
              </th>
              <th className="px-8 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Performance Score
              </th>
              <th className="px-8 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {faculties?.map((f: any, index: number) => (
              <tr 
                key={`${f.faculty_id}-${index}`} 
                className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 dark:hover:from-blue-500/5 dark:hover:to-purple-500/5 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {f.faculty_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                        ID: {f.faculty_id}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-8 py-5">
                  <span className="inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                    {f.department}
                  </span>
                </td>
                
                <td className="px-8 py-5 text-center">
                  <div className="inline-flex items-center justify-center">
                    <span className={`text-2xl font-black tabular-nums px-5 py-2 rounded-xl font-mono
                      ${parseFloat(f.final_evaluation_score) >= 4.0 
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20' 
                        : parseFloat(f.final_evaluation_score) >= 3.0 
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20'
                          : 'bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20'
                      }`}>
                      {f.final_evaluation_score}
                    </span>
                  </div>
                </td>
                
                <td className="px-8 py-5 text-center">
                  <Link
                    href={`/faculty/${f.faculty_id}`}
                    className="group/btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 
                             bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-500/20 
                             rounded-xl border-2 border-blue-200 dark:border-blue-500/20 hover:border-blue-600 dark:hover:border-blue-500/40 
                             transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    View Report
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
                  </Link>
                </td>
              </tr>
            ))}
            
            {faculties?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" strokeWidth={2} />
                    </div>
                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                      No faculty found matching your criteria
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Try adjusting your search or filter settings
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/30 to-transparent dark:from-white/[0.01]">
        
        {/* Records Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium order-2 sm:order-1">
          Showing{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, pagination.total || 0)}
          </span>{' '}
          of{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {pagination.total || 0}
          </span>{' '}
          records
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 order-1 sm:order-2">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 
                     hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 
                     rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 
                     transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            Previous
          </button>

          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage >= (pagination.total_pages || 1) || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white 
                     bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                     rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none 
                     transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            Next
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}