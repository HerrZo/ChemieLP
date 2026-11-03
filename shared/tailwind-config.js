// Shared Tailwind Config für alle ChemieLP-Seiten
// Einbinden NACH dem Tailwind CDN-Script
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        colors: {
          chem: {
            50:  '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
          }
        },
        keyframes: {
          fadeIn:  { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          float:   { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        },
        animation: {
          fadeIn:  'fadeIn 0.5s ease-out forwards',
          slideUp: 'slideUp 0.6s ease-out forwards',
          float:   'float 4s ease-in-out infinite',
        }
      }
    }
  };
}
