/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f4',
          100: '#dcede6',
          200: '#bcddd0',
          300: '#8ec5b2',
          400: '#5ca48e',
          500: '#3a8a73',
          600: '#2d6a4f',
          700: '#265a43',
          800: '#214a38',
          900: '#1a3a2d',
        },
        amber: {
          50:  '#fff8f0',
          100: '#ffeedd',
          200: '#ffd9b3',
          300: '#ffc07a',
          400: '#f4a261',
          500: '#e8853a',
          600: '#d4692a',
        },
        cream: {
          50:  '#fefcf8',
          100: '#fdf8f2',
          200: '#faf2e8',
          300: '#f5e8d8',
        },
        slate: {
          750: '#2d3748',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft':   '0 2px 8px 0 rgba(0,0,0,0.06)',
        'medium': '0 4px 16px 0 rgba(0,0,0,0.08)',
        'large':  '0 8px 32px 0 rgba(0,0,0,0.12)',
        'inner-soft': 'inset 0 1px 3px 0 rgba(0,0,0,0.06)',
        'forest': '0 4px 16px 0 rgba(45,106,79,0.25)',
        'amber':  '0 4px 16px 0 rgba(244,162,97,0.30)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },              to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      }
    }
  },
  plugins: []
}
