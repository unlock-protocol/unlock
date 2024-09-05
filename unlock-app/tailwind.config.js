module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{tsx,ts,jsx,js,html}',
    './../node_modules/@unlock-protocol/ui/dist/*.{js,css}',
    './node_modules/frames.js/dist/render/next/*.{ts,tsx,js,css}',
    './node_modules/frames.js/dist/render/*.{ts,tsx,js,css}',
    './node_modules/frames.js/dist/**/*.{ts,tsx,js,css}',
  ],
  presets: [require('@unlock-protocol/ui/dist/unlock-tailwind-preset')],
}
