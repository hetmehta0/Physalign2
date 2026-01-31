/* TAILWIND CONFIGURATION FOR CUSTOM COLORS */
/* Add this to your tailwind.config.js */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}