'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Handle scroll effect for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/fairness', label: 'Fairness' },
    { href: '/audit', label: 'Blockchain Audit' },
    { href: '/validation', label: 'Validation' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/ethics', label: 'Ethics' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass shadow-lg shadow-black/5 dark:shadow-black/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                Project Evolve
              </span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest -mt-0.5">
                AI-Powered Evaluation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-4/5 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Blockchain Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Blockchain Verified
              </span>
            </div>

            {/* Theme Toggle Button */}
            {/* Theme Toggle Button - Enhanced Version */}
<button
  onClick={() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    console.log('🎨 Theme switched to:', newTheme); // Debug: Check console!
  }}
  className={`
    relative p-2.5 rounded-xl 
    bg-gray-100 dark:bg-white/5 
    hover:bg-gray-200 dark:hover:bg-white/10 
    hover:scale-110 active:scale-95
    border border-gray-200 dark:border-white/10 
    transition-all duration-300 group
    cursor-pointer
  `}
  aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
  title={resolvedTheme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
>
  <div className="relative w-5 h-5 flex items-center justify-center">
    {resolvedTheme === 'dark' ? (
      /* Sun Icon - Shown in Dark Mode */
      <Sun 
        className="
          w-5 h-5 text-yellow-500 
          rotate-0 scale-100 
          group-hover:rotate-45 
          group-hover:scale-110
          transition-all duration-300 
          drop-shadow-sm
        " 
        strokeWidth={2} 
        fill="none" 
        viewBox="0 0 24 24" 
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </Sun>
    ) : (
      /* Moon Icon - Shown in Light Mode */
      <Moon 
        className="
          w-5 h-5 text-gray-700 
          rotate-0 scale-100 
          group-hover:-rotate-12 
          group-hover:scale-110
          transition-all duration-300 
        " 
        strokeWidth={2} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 00-21 12.79z" />
      </Moon>
    )}
    
    {/* Animated Ring Effect on Hover */}
    <div className="
      absolute inset-0 rounded-xl 
      bg-gradient-to-r from-yellow-400/20 to-orange-400/20 
      opacity-0 group-hover:opacity-100 
      scale-50 group-hover:scale-150
      blur-xl
      transition-all duration-500
      pointer-events-none
    " />
  </div>
</button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 animate-fade-in-up">
            <div className="glass-dark rounded-2xl p-4 space-y-1 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 rounded-xl transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Blockchain Status */}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Verified on Blockchain
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}