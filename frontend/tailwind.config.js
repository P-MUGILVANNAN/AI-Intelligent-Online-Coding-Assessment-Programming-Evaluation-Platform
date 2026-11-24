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
        brand: {
          50: '#f4f4fc',
          100: '#e9e9f9',
          200: '#d5d6f4',
          300: '#b4b5eb',
          400: '#8c8de0',
          500: '#6461d0',
          600: '#4844af',
          700: '#2F2D7D', // Primary FIIT Brand Color
          800: '#252366',
          900: '#1c1b52',
          950: '#111033',
        },
        fiit: {
          DEFAULT: '#2F2D7D',
          primary: '#2F2D7D',
          light: '#4b47b8',
          accent: '#7975e2',
          soft: '#a5a3ee',
          surface: '#18173d',
          card: '#141334',
          border: '#2a276b',
          dark: '#0c0b24',
          darker: '#080718',
        },
        navy: {
          800: '#1a1943',
          900: '#121132',
          950: '#0c0b24',
        }
      }
    },
  },
  plugins: [],
}
