/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020817',
          900: '#0A1628',
          800: '#0F1F35',
          700: '#1a2d45',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        gold: '#F59E0B',
        // Preserve existing tokens
        primary: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
        },
        surface: {
          50: '#FAF9F6',
          100: '#F5F5F0',
          200: '#E8E8E3',
          300: '#D6D6CF',
          400: '#BDBDB4',
          500: '#A1A198',
          600: '#84847C',
          700: '#6A6A63',
          800: '#52524D',
          900: '#3F3F3B',
        },
        success: { 50: '#F0FDF4', 200: '#BBF7D0', 400: '#4ADE80', 500: '#22C55E', 700: '#15803D' },
        warning: { 50: '#FFFBEB', 200: '#FDE68A', 400: '#FACC15', 500: '#EAB308', 700: '#A16207' },
        danger: { 50: '#FEF2F2', 200: '#FECACA', 400: '#F87171', 500: '#EF4444', 700: '#B91C1C' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 1.2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(13,148,136,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(13,148,136,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #2DD4BF, #0D9488)',
        'dark-gradient': 'linear-gradient(180deg, #020817 0%, #0A1628 100%)',
        'card-gradient': 'linear-gradient(135deg, #0F1F35, #0A1628)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(45,212,191,0.1), transparent)',
      },
    },
  },
  plugins: [],
}
