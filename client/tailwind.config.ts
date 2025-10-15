// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f7ff',
          100: '#e9edff',
          200: '#cdd7ff',
          300: '#a9b9ff',
          400: '#7f93ff',
          500: '#5a74ff',
          600: '#3e55f7',
          700: '#2f42cf',
          800: '#2636a6',
          900: '#232f86',
        },
      },
      boxShadow: { card: '0 8px 24px rgba(0,0,0,0.06)' },
      borderRadius: { xl: '1rem' },
    },
  },
  plugins: [],
} satisfies Config
