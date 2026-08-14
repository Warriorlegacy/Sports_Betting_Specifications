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
        darkBg: '#080c16',
        cardBg: '#101726',
        cardBorder: '#1e293b',
        backBlue: '#2563eb',
        backHover: '#1d4ed8',
        backLight: '#1e3a8a',
        backSubtle: '#172554',
        layPink: '#ec4899',
        layHover: '#db2777',
        layLight: '#831843',
        laySubtle: '#500724',
      }
    },
  },
  plugins: [],
}
