/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Space Grotesk"', 'ui-serif', 'Georgia', 'serif'],
        display: ['Syne', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['"Instrument Serif"', 'Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        background: '#030711',
        foreground: '#e1e7ef',
        muted: {
          foreground: '#7f8ea3',
        },
      },
      backgroundImage: {
        'rex-gradient': 'linear-gradient(to right, #0ea5e9, #6366f1)',
        'hero-radial':
          'radial-gradient(ellipse at top left, #0c4a6e 0%, #000000 50%, #030711 100%)',
      },
      animation: {
        'scroll-left': 'scroll-left 80s linear infinite',
        'scroll-left-slow': 'scroll-left 95s linear infinite',
        'scroll-left-medium': 'scroll-left 42s linear infinite',
        'scroll-left-fast': 'scroll-left 22s linear infinite',
        'scroll-left-ticker': 'scroll-left 28s linear infinite',
        'scroll-right-slow': 'scroll-right 96s linear infinite',
        'scroll-right': 'scroll-right 76s linear infinite',
        'scroll-right-news': 'scroll-right 32s linear infinite',
        'scroll-left-news': 'scroll-left 32s linear infinite',
        'float-a': 'float-y 4.2s ease-in-out infinite',
        'float-b': 'float-y 5.1s ease-in-out infinite reverse',
        'float-c': 'float-y 3.6s ease-in-out infinite',
        'chase-spin': 'chase-spin 4.5s linear infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'chase-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
