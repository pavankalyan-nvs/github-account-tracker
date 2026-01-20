/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic dark theme colors
        dark: {
          'bg-primary': '#0f172a',      // slate-900
          'bg-secondary': '#1e293b',    // slate-800
          'bg-tertiary': '#334155',     // slate-700
          'border-primary': '#475569',  // slate-600
          'border-secondary': '#64748b', // slate-500
          'text-primary': '#f8fafc',    // slate-50
          'text-secondary': '#cbd5e1',  // slate-300
          'text-tertiary': '#94a3b8',   // slate-400
        },
        // Accent colors with hover states
        accent: {
          blue: {
            DEFAULT: '#3b82f6',
            hover: '#2563eb',
            light: '#60a5fa',
          },
          green: {
            DEFAULT: '#10b981',
            hover: '#059669',
            light: '#34d399',
          },
          red: {
            DEFAULT: '#ef4444',
            hover: '#dc2626',
            light: '#f87171',
          },
          yellow: {
            DEFAULT: '#f59e0b',
            hover: '#d97706',
            light: '#fbbf24',
          },
          purple: {
            DEFAULT: '#a855f7',
            hover: '#9333ea',
            light: '#c084fc',
          },
          pink: {
            DEFAULT: '#ec4899',
            hover: '#db2777',
            light: '#f472b6',
          },
          orange: {
            DEFAULT: '#f97316',
            hover: '#ea580c',
            light: '#fb923c',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.2s ease-in',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
