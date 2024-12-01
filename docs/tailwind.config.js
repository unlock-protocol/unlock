/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
    container: false,
  },
  content: [
    './src/**/*.{tsx,ts,jsx,js,html}',
    './../node_modules/@unlock-protocol/ui/dist/*.{js,css}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  presets: [require('@unlock-protocol/ui/dist/unlock-tailwind-preset')],
  theme: {
    extend: {
      backgroundColor: {
        'dark-card': '#282a2d',
      },
      colors: {
        gray: {
          800: '#282a2d',
          900: '#1a1c1e',
        },
      },
    },
  },
}
