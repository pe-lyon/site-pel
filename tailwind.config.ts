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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-pel': 'linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%)',
      },
    },
  },
  plugins: [],
}

export default config
