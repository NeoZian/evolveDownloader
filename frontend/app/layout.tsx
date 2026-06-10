import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Project Evolve | Fair Faculty Evaluation System',
  description: 'AI-Powered, Explainable, and Blockchain-Secured Transparent Faculty Evaluation Platform with Real-time Analytics and Bias Detection',
  keywords: ['faculty evaluation', 'AI', 'explainable AI', 'blockchain', 'fairness', 'academic assessment'],
  authors: [{ name: 'Project Evolve Team' }],
  openGraph: {
    title: 'Project Evolve | Fair Faculty Evaluation',
    description: 'Transparent AI-powered faculty evaluation with blockchain security',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{__html: `
      try {
        if (localStorage.theme === 'dark' || 
            (!('theme' in localStorage) && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } catch (_) {}
    `}} />
  </head>
  
  <body className={`${inter.className} bg-white dark:bg-[#030712] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 dark:from-[#030712] dark:via-[#0a0a0f] dark:to-[#030712]">
            {children}
          </main>
          
          {/* Subtle Footer */}
          <footer className="border-t border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PE</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Project Evolve v2.0
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                  AI-Powered • Explainable • Blockchain Secured • Fair & Transparent
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}