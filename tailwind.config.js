/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-up': 'floatUp 1.2s ease-in-out infinite',
        'float-right': 'floatRight 1.2s ease-in-out infinite',
        'float-left': 'floatLeft 1.2s ease-in-out infinite',
        'float-diag': 'floatDiag 1.2s ease-in-out infinite',
        'float-up-delay': 'floatUp 1.5s 0.3s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(-60px) scale(1.3)', opacity: '0' },
        },
        floatRight: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateX(60px) scale(1.3)', opacity: '0' },
        },
        floatLeft: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateX(-60px) scale(1.3)', opacity: '0' },
        },
        floatDiag: {
          '0%': { transform: 'translate(0,0) scale(1)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translate(40px,-40px) scale(1.3)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
};