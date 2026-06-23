/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Space Grotesk"', 'ui-serif', 'Georgia', 'serif'],
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
        'scroll-left': 'scroll-left 40s linear infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
