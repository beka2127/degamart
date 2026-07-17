/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6',
        },
        surface: {
          DEFAULT: '#f8f5ff',
          soft: '#eef2ff',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
};
