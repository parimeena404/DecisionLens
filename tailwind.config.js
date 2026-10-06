/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      colors: {
        surface: {
          0: '#ffffff',
          1: '#f8f9fa',
          2: '#f1f3f5',
          3: '#e9ecef',
        },
        ink: {
          900: '#1a1a2e',
          800: '#2d2d3f',
          700: '#3d3d52',
          600: '#525266',
          500: '#6b6b80',
          400: '#8b8b9e',
          300: '#adadbd',
          200: '#d0d0da',
          100: '#e8e8ee',
          50: '#f4f4f7',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        risk: {
          low: '#059669',
          'low-bg': '#ecfdf5',
          'low-border': '#a7f3d0',
          medium: '#d97706',
          'medium-bg': '#fffbeb',
          'medium-border': '#fde68a',
          high: '#dc2626',
          'high-bg': '#fef2f2',
          'high-border': '#fecaca',
        },
        evidence: {
          strong: '#059669',
          'strong-bg': '#ecfdf5',
          moderate: '#d97706',
          'moderate-bg': '#fffbeb',
          preliminary: '#6366f1',
          'preliminary-bg': '#eef2ff',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'sidebar': '1px 0 0 0 #e8e8ee',
      },
    },
  },
  plugins: [],
};
