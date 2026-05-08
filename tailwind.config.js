/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'architect-bg': '#050505',
        'architect-surface': '#111111',
        'architect-green': '#52d053',
        'architect-orange': '#ff6b2c',
        'architect-blue': '#57c7ff',
        'architect-gold': '#f6c453',
        'lava': '#ff4d4d',
        'sky': '#57c7ff',
        'grass': '#52d053',
        'sand': '#f6c453',
        'stone': '#1c1c1c',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
      }
    },
  },
  plugins: [],
}
