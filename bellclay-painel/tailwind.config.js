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
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
