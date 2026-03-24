/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0047AB',
        'primary-dim': '#003a8c',
        'primary-container': '#D6E4FF',
        secondary: '#FF7F50',
        'secondary-dim': '#e06940',
        'secondary-container': '#FFE4D9',
        tertiary: '#00A86B',
        'tertiary-dim': '#008a56',
        'tertiary-container': '#C8F5E2',
        surface: '#F7F8FC',
        'surface-low': '#F0F1F7',
        'surface-lowest': '#FFFFFF',
        'surface-high': '#E3E5EC',
        'surface-highest': '#D6D9E4',
        'on-surface': '#1A1D2E',
        'on-surface-variant': '#4A4E63',
        'outline-variant': '#BFC3D4',
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        float: '0 10px 40px rgba(26,29,46,0.06)',
        rise: '0 16px 48px rgba(26,29,46,0.10)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0047AB 0%, #759eff 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #FF7F50 0%, #ffb08a 100%)',
        'tertiary-gradient': 'linear-gradient(135deg, #00A86B 0%, #5de0b0 100%)',
      },
      animation: {
        'pillar-scroll': 'pillarScrollContinuous 40s linear infinite',
        'role-carousel': 'roleCarousel 30s linear infinite',
        'infinite-slider': 'infiniteSlider 10s linear infinite',
        'ranking-slide': 'rankingSmoothSlide 12s ease-in-out infinite',
        'interest-up': 'interestUpAndOut 9s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'slider-card': 'sliderCard 15s ease-in-out infinite',
      },
      keyframes: {
        pillarScrollContinuous: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        roleCarousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        infiniteSlider: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rankingSmoothSlide: {
          '0%, 25%': { opacity: '1', transform: 'translateY(0)' },
          '30%, 55%': { opacity: '0', transform: 'translateY(-20px)' },
          '60%, 85%': { opacity: '1', transform: 'translateY(0)' },
          '90%, 100%': { opacity: '0', transform: 'translateY(-20px)' },
        },
        interestUpAndOut: {
          '0%, 20%': { opacity: '1', transform: 'translateY(0)' },
          '25%, 55%': { opacity: '0', transform: 'translateY(-30px)' },
          '60%, 80%': { opacity: '1', transform: 'translateY(0)' },
          '85%, 100%': { opacity: '0', transform: 'translateY(-30px)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.5)' },
        },
        sliderCard: {
          '0%, 18%': { opacity: '1', zIndex: '10' },
          '20%, 100%': { opacity: '0', zIndex: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
