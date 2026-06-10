'use client';
import { Scale, Eye, FileCheck, Lock, Users, Heart } from 'lucide-react';

export default function EthicsPage() {
  const principles = [
    {
      id: 1,
      title: 'Fairness',
      description: 'Comprehensive bias audits with active mitigation strategies for gender and department-based disparities in evaluation outcomes.',
      icon: Scale,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'Transparency',
      description: 'SHAP and LIME explanations provide complete visibility into AI decision-making with full blockchain audit trails.',
      icon: Eye,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 3,
      title: 'Accountability',
      description: 'Immutable records stored on blockchain with continuous faculty feedback loops and parallel-run validation modes.',
      icon: FileCheck,
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      id: 4,
      title: 'Privacy & Security',
      description: 'Anonymized data processing with private Ganache blockchain and enterprise-grade secure data pipelines.',
      icon: Lock,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 5,
      title: 'Human-Centric Design',
      description: 'Co-designed with faculty stakeholders and ethics board review. Actionable development feedback with no automatic high-stakes decisions.',
      icon: Heart,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600',
      featured: true
    }
  ];

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-28 pb-16">
        
        {/* Page Header */}
        <div className="mb-14 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg opacity-60" />
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg shadow-purple-500/25">
                <Scale className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Ethical Framework & Co-Design
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Phase 1 — Established with faculty representation and ethics board review
              </p>
            </div>
          </div>
          
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-full">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
              Stakeholder-Approved Framework
            </span>
          </div>
        </div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {principles.map((principle, index) => (
            <div 
              key={principle.id}
              className={`group relative ${principle.featured ? 'md:col-span-2' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`relative bg-white dark:bg-[#12121a] rounded-3xl p-8 lg:p-10 border-2 
                            ${principle.color === 'blue' ? 'border-blue-200/50 dark:border-blue-800/30 hover:border-blue-400/50 dark:hover:border-blue-600/40' : ''}
                            ${principle.color === 'emerald' ? 'border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-600/40' : ''}
                            ${principle.color === 'purple' ? 'border-purple-200/50 dark:border-purple-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/40' : ''}
                            ${principle.color === 'amber' ? 'border-amber-200/50 dark:border-amber-800/30 hover:border-amber-400/50 dark:hover:border-amber-600/40' : ''}
                            ${principle.color === 'rose' ? 'border-rose-200/50 dark:border-rose-800/30 hover:border-rose-400/50 dark:hover:border-rose-600/40' : ''}
                            shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
              >
                
                {/* Background Gradient Accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${principle.color === 'blue' ? 'from-blue-500/5 via-transparent to-blue-500/5' : ''} 
                              ${principle.color === 'emerald' ? 'from-emerald-500/5 via-transparent to-emerald-500/5' : ''} 
                              ${principle.color === 'purple' ? 'from-purple-500/5 via-transparent to-purple-500/5' : ''} 
                              ${principle.color === 'amber' ? 'from-amber-500/5 via-transparent to-amber-500/5' : ''} 
                              ${principle.color === 'rose' ? 'from-rose-500/5 via-transparent to-rose-500/5' : ''} 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Decorative Circle */}
                <div className={`absolute -right-20 -top-20 w-56 h-56 rounded-full bg-gradient-to-br ${principle.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-all duration-700 group-hover:scale-125`} />

                <div className="relative z-10 flex gap-6">
                  
                  {/* Numbered Icon Container */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${principle.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${principle.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <principle.icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      
                      {/* Number Badge */}
                      <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${principle.gradient} flex items-center justify-center text-white text-xs font-black shadow-lg border-2 border-white dark:border-[#12121a]`}>
                        {principle.id}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-2xl font-bold mb-3 tracking-tight
                      ${principle.color === 'blue' ? 'text-blue-800 dark:text-blue-200' : ''}
                      ${principle.color === 'emerald' ? 'text-emerald-800 dark:text-emerald-200' : ''}
                      ${principle.color === 'purple' ? 'text-purple-800 dark:text-purple-200' : ''}
                      ${principle.color === 'amber' ? 'text-amber-800 dark:text-amber-200' : ''}
                      ${principle.color === 'rose' ? 'text-rose-800 dark:text-rose-200' : ''}
                    `}>
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-base">
                      {principle.description}
                    </p>
                    
                    {principle.featured && (
                      <div className="mt-5 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" strokeWidth={2} />
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                          Core Principle • Human First
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}