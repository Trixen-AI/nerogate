/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // The site container (padding steps per breakpoint) lives in src/styles/components.css.
    container: false,
  },
  theme: {
    screens: {
      xs: '712px',
      sm: '1080px',
      md: '1200px',
      lg: '1440px',
      xl: '1920px',
    },
    extend: {
      spacing: {
        18: '4.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        '4xl': '32px',
      },
      colors: {
        ink: {
          DEFAULT: 'var(--color-darkest)',
          0: 'var(--n-0)',
          4: 'var(--n-4)',
          6: 'var(--n-6)',
          10: 'var(--n-10)',
          30: 'var(--n-30)',
          50: 'var(--n-50)',
          60: 'var(--n-60)',
          80: 'var(--n-80)',
          98: 'var(--n-98)',
          100: 'var(--n-100)',
        },
        ember: {
          40: 'var(--ember-40)',
          60: 'var(--ember-60)',
        },
        'veil-black-16': 'rgba(0, 0, 0, 0.16)',
        'veil-white-4': 'rgba(255, 255, 255, 0.04)',
        'veil-white-16': 'rgba(255, 255, 255, 0.16)',
      },
    },
  },
  plugins: [],
}
