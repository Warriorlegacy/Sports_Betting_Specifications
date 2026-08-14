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
        darkBg: '#0b0f19',
        cardBg: '#131b2e',
        cardBorder: '#1e293b',
        brandPrimary: '#3b82f6',
        brandSuccess: '#10b981',
        brandWarning: '#f59e0b',
        brandDanger: '#ef4444',
        backBlue: '#2563eb',
        backLight: '#dbeafe',
        layPink: '#ec4899',
        layLight: '#fce7f3',
      }
    },
  },
  plugins: [],
}
