import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'fountain-blue': {
          50: '#f0fbfa',
          100: '#d8f5f5',
          200: '#b5eaec',
          300: '#83d9dd',
          400: '#3ab7bf',
          500: '#2da3ad',
          600: '#288592',
          700: '#266c78',
          800: '#275963',
          900: '#254a54',
          950: '#133139',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
