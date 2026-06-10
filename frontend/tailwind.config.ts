// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ✅ IMPORTANT: Scan these folders for Tailwind classes
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  
  // ✅ CRITICAL: Enable class-based dark mode for next-themes!
  darkMode: "class",
  
  theme: {
    extend: {},
  },
  
  plugins: [],
};

export default config;