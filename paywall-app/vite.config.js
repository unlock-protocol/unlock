// vite is only used to compile the `lib/cdn.js` file
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/cdn.js'),
      fileName: 'unlock.latest.min',
      formats: ['umd'],
    },
  },
})
