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
        brand: {
          dark: '#020207',
          gray: '#535353',
          primary: '#FFF7E8',
          secondary: '#FF6771',
          ui: {
            primary: '#603DEB',
            secondary: '#020207',
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
