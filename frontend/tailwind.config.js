/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B4FF00',
        'deep-matrix': '#0B1A12',
        surface: '#0E2117',
        'surface-light': '#142E20',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
