import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // GenFlow Brand Colors
      colors: {
        // Navy Scale
        navy: {
          950: '#0A0F2E',
          900: '#0F1435',
          800: '#181c34',
          700: '#1E2448',
          600: '#2A3158',
        },
        // Teal Scale
        teal: {
          600: '#1A6B62',
          500: '#298581',
          400: '#3D9E97',
          300: '#5CB8B2',
        },
        // Gold Scale
        gold: {
          600: '#C49A2E',
          500: '#ECBA3D',
          400: '#F0C85A',
          300: '#F4D47A',
        },
      },
      
      // Typography
      fontFamily: {
        primary: ['IRANSansX', 'Vazirmatn', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      // Font Sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.8125rem', { lineHeight: '1.5' }],
        'base-sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['0.9375rem', { lineHeight: '1.65' }],
        'base-lg': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.75rem', { lineHeight: '1.3' }],
      },
      
      // Spacing (8px base)
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      
      // Shadows
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 22px rgba(0, 0, 0, 0.1)',
        'xl': '0 16px 40px rgba(0, 0, 0, 0.12)',
      },
      
      // Animation
      transitionDuration: {
        'instant': '50ms',
        'fast': '150ms',
        'DEFAULT': '250ms',
        'slow': '400ms',
        'slower': '600ms',
      },
      
      // Keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
