/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FD7687',
          'pink-hover': '#f06073',
          'pink-light': '#FFF0F2',
          'pink-subtle': '#FFE2E6',
          green: '#83BC5C',
          'green-hover': '#71a64d',
          'green-light': '#F1F8EC',
          'green-subtle': '#E2F2D7',
          porcelain: '#FDFBF7',
          cream: '#F7F3EC',
          clay: '#EFEAE1',
          charcoal: '#2B2625',
          muted: '#756D69',
          border: '#EAE3DA',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(253, 118, 135, 0.08), 0 2px 6px -1px rgba(43, 38, 37, 0.04)',
        'soft-hover': '0 12px 30px -4px rgba(253, 118, 135, 0.16), 0 4px 12px -2px rgba(43, 38, 37, 0.06)',
        'green-soft': '0 6px 20px -2px rgba(131, 188, 92, 0.2)',
        'pink-soft': '0 6px 20px -2px rgba(253, 118, 135, 0.25)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
