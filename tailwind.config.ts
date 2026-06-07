import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pel-bleu': '#04439a',
        'pel-rouge': '#b21d0b',
        'pel-blanc': '#ffffff',
        'pel-creme': '#f8f7f4',
        'pel-bleu-light': '#e8f0fb',
        'pel-gris': '#6b7280',
        'pel-gris-light': '#e5e7eb',
        'pel-noir': '#111827',
        // Legacy colors (kept for dashboard compatibility)
        pel: {
          blue: '#1a3a6b',
          'blue-light': '#2c5282',
          'blue-dark': '#0f2547',
          red: '#c41e3a',
          'red-light': '#e53e5a',
          gold: '#c9a84c',
          'gray-light': '#f8f9fa',
          'gray-mid': '#e9ecef',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        title: ['var(--font-titre)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-pel': 'linear-gradient(135deg, #04439a 0%, #033278 100%)',
      },
    },
  },
  plugins: [],
}

export default config
