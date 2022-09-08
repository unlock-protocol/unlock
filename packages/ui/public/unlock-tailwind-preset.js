const defaultTheme = require('tailwindcss/defaultTheme')
const typography = require('@tailwindcss/typography')
const forms = require('@tailwindcss/forms')
const lineClamp = require('@tailwindcss/line-clamp')
const aspectRatio = require('@tailwindcss/aspect-ratio')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./lib/**/*.{tsx,jsx,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        beige: {},
        brand: {
          dark: '#020207',
          gray: '#535353',
          primary: '#FFF7E8',
          secondary: '#FF6771',
          beige: '#FFFDF8',
          ui: {
            primary: '#603DEB',
            secondary: '#020207',
          },
        },
        ui: {
          main: {
            50: '#E1DAFF',
            100: '#BFB1F7',
            200: '#A08BF3',
            300: '#9077F1',
            400: '#8064EF',
            500: '#603DEB',
            600: '#5637D4',
            700: '#4D31BC',
            800: '#432BA5',
            900: '#3A258D',
          },
          secondary: {
            50: 'FFFDFA',
            100: 'FFFDF8',
            200: 'FFFCF6',
            300: '#FFFAF1',
            400: '#FFF9ED',
            500: '#FFF7E8',
            600: '#EBDABA',
            700: '#D7BD8B',
            800: '#C39F5D',
            900: '#AF822E',
          },
        },
      },
    },
  },
  plugins: [
    typography,
    forms,
    aspectRatio,
    lineClamp,
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        '.glass-pane': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(50px)',
        },
      })
    }),
  ],
}
