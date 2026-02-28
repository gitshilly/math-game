/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'star-spin': 'starSpin 1s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'fire': 'fire 0.5s ease-in-out infinite alternate',
        'coin-flip': 'coinFlip 0.6s ease-out',
        'level-up': 'levelUp 1s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        starSpin: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fire: {
          '0%': { transform: 'scale(1) rotate(-2deg)' },
          '100%': { transform: 'scale(1.1) rotate(2deg)' },
        },
        coinFlip: {
          '0%': { transform: 'rotateY(0deg) scale(0.5)', opacity: '0' },
          '50%': { transform: 'rotateY(180deg) scale(1.2)' },
          '100%': { transform: 'rotateY(360deg) scale(1)', opacity: '1' },
        },
        levelUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0', filter: 'brightness(2)' },
          '50%': { transform: 'scale(1.3)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', opacity: '1', filter: 'brightness(1)' },
        },
      },
    },
  },
  plugins: [],
}
