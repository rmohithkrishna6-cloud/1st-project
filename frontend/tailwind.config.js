/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#080A0F',
        graphite: '#121620',
        'graphite-light': '#1A202C',
        'graphite-border': 'rgba(255, 255, 255, 0.08)',
        primary: '#FF5A1F',          // Codeticz Orange
        'primary-hover': '#FF6D38',
        'primary-dark': '#E04812',
        ember: '#FF304F',            // Ember Red
        ice: '#F4F7FB',              // Ice White
        surface: '#121620',
        'surface-dark': '#080A0F',
        'surface-card': '#121620',
        'surface-panel': '#121620',
        'deep-matrix': '#080A0F',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #FF5A1F 0%, #FF304F 100%)',
        'flame-glow': 'radial-gradient(circle, rgba(255, 90, 31, 0.15) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
