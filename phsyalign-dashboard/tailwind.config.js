/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // toggle dark mode with a class
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from CSS variables
        'bg-main': '#fafbfc',
        'bg-card': '#ffffff',
        'text-primary': '#1a1a2e',
        'text-secondary': '#64748b',
        'text-muted': '#a1a1aa',
        'border-light': '#f1f5f9',
        'border-default': '#e2e8f0',
        'bg-header': '#1e293b',
        'accent': '#0d9488',
        'accent-hover': '#0f766e',
        'accent-soft': '#ccfbf1',
        
        // Existing colors
        bg: '#fafbfc',
        card: '#ffffff',
        primary: '#1a1a2e',
        secondary: '#64748b',
        muted: '#a1a1aa',
        border: '#e2e8f0',
        header: '#1e293b',
        sidebar: '#f8fafc',
        'accent-hover': '#0f766e',
        'accent-soft': '#ccfbf1',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },

      boxShadow: {
        'custom-accent': '0 4px 12px rgba(13, 148, 136, 0.3)',
        'custom-accent-hover': '0 6px 16px rgba(13, 148, 136, 0.4)',
        'custom-button': '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
        'custom-button-hover': '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
        'custom-card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.02)',
      },

      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      maxWidth: {
        '5xl': '80rem',
      },

      borderRadius: {
        xl: '12px', // for rounded cards
        '2xl': '16px', // for larger rounded cards
        '3xl': '24px', // for extra large rounded cards
      },
    },
  },
  plugins: [],
}
