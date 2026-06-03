/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    // Status badges + role badges dynamiques
    { pattern: /^(bg|text|border)-(amber|emerald|rose|blue|indigo|purple|teal)-(400|500)(\/\d+)?$/ },
    { pattern: /^(bg|text|border)-(amber|emerald|rose|blue|indigo)-(500)\/(10|20|30)$/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan:  '#00c6fb',
          blue:  '#005bea',
          purple: '#7b61ff',
          mint:   '#06d6a0',
        },
      },
      animation: {
        'gradient':    'gradientShift 14s ease infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up':  'fadeInUp 0.4s ease forwards',
        'slide-in':    'slideInRight 0.3s ease forwards',
      },
      boxShadow: {
        'glow':    '0 0 40px rgba(0, 198, 251, 0.20)',
        'glow-lg': '0 0 60px rgba(0, 91, 234, 0.30)',
      },
    },
  },
  plugins: [],
}
