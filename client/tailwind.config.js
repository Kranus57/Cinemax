/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#06070a',
          900: '#0c0e14',
          850: '#12151f',
          800: '#181c2a',
          700: '#23293d',
          accent: '#e50914', // Cinema red
          gold: '#f59e0b',   // Premium seat gold
          cyan: '#06b6d4',   // Recliner neon cyan
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
