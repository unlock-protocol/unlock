/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{tsx,ts,jsx,js,html,mdx}',
    './app/**/*.{tsx,ts,jsx,js,html,mdx}',
    './components/**/*.{tsx,ts,jsx,js,html,mdx}',
    './../node_modules/@unlock-protocol/ui/dist/*.{js,css}',
  ],
  presets: [require('@unlock-protocol/ui/dist/unlock-tailwind-preset')],
}
