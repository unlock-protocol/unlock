const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{tsx,ts,jsx,js,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primar Blue Dark
        'brand-dark': '#020207',
        // Dark Gray
        'brand-gray': '#535353',
        // Beige
        'brand-primary': '#FFF7E8',
        // Reddish
        'brand-secondary': '#FF6771',
        // Primary blue
        'brand-ui-primary': '#603DEB',
        // Primar Blue Dark
        'brand-ui-secondary': '#020207',
      },
    },
  },
  plugins: [],
}
