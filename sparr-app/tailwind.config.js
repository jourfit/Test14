/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#A8FF00',
        lime: '#7CFF00',
        energy: '#39D000',
        'sparr-black': '#0D0D0D',
        'sparr-dark': '#1A1A1A',
        'sparr-mid': '#111111',
        'sparr-surface': '#1E1E1E',
        'sparr-border': 'rgba(168,255,0,0.15)',
        'sparr-border-dim': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Raleway', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #A8FF00 0%, #39D000 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(168,255,0,0.3), 0 0 60px rgba(168,255,0,0.1)',
        'neon-sm': '0 0 10px rgba(168,255,0,0.2)',
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card': '0 2px 12px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        pulseNeon: {
          '0%,100%': { boxShadow: '0 0 10px rgba(168,255,0,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(168,255,0,0.5)' },
        },
        slideIn: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
