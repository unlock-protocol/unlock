/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './../node_modules/@unlock-protocol/ui/dist/*.{js,css}',
  ],
  presets: [require('@unlock-protocol/ui/dist/unlock-tailwind-preset')],
}
