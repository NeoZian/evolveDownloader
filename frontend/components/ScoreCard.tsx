import { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color?: 'blue' | 'amber' | 'emerald';
  icon?: LucideIcon;
}

export default function ScoreCard({ title, value, subtitle, color = 'blue', icon: Icon }: ScoreCardProps) {
  const colorConfig = {
    blue: {
      bg: 'from-blue-500/10 via-blue-500/5 to-transparent',
      border: 'border-blue-200/50 dark:border-blue-800/30',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconShadow: 'shadow-lg shadow-blue-500/25',
      valueBg: 'from-blue-600 to-blue-700',
      glow: 'hover:shadow-blue-500/20'
    },
    amber: {
      bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
      border: 'border-amber-200/50 dark:border-amber-800/30',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconShadow: 'shadow-lg shadow-amber-500/25',
      valueBg: 'from-amber-600 to-orange-600',
      glow: 'hover:shadow-amber-500/20'
    },
    emerald: {
      bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-200/50 dark:border-emerald-800/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      iconShadow: 'shadow-lg shadow-emerald-500/25',
      valueBg: 'from-emerald-600 to-green-700',
      glow: 'hover:shadow-emerald-500/20'
    }
  };

  const config = colorConfig[color];

  return (
    <div className={`group relative bg-white dark:bg-[#12121a] rounded-3xl p-8 border ${config.border} 
                  shadow-md hover:shadow-2xl ${config.glow} transition-all duration-500 ease-out 
                  hover:-translate-y-1 overflow-hidden`}>
      
      {/* Background Gradient Accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Decorative Circle */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${config.bg} blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-700`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title */}
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              {title}
            </p>
            
            {/* Value with gradient background */}
            <div className="relative inline-block">
              <span className={`text-5xl lg:text-6xl font-extrabold tracking-tight ${config.text} 
                            bg-clip-text text-transparent bg-gradient-to-r ${config.valueBg} 
                            group-hover:scale-105 inline-block transition-transform duration-300`}>
                {value}
              </span>
              {/* Subtle glow under value */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${config.valueBg} blur-xl opacity-0 group-hover:opacity-20 -z-10 transition-opacity duration-500`} />
            </div>
            
            {/* Subtitle */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          {/* Icon Container */}
          {Icon && (
            <div className={`relative ml-4 flex-shrink-0`}>
              <div className={`absolute inset-0 ${config.iconBg} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              <div className={`relative ${config.iconBg} ${config.iconShadow} p-3.5 rounded-2xl 
                              transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" 
             style={{ color: color === 'blue' ? '#3b82f6' : color === 'amber' ? '#f59e0b' : '#10b981' }} />
      </div>
    </div>
  );
}