// vite is only used to compile the `lib/cdn.js` file
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    copyPublicDir: false,
    outDir: 'public/static',
    lib: {
      entry: resolve('lib/cdn.js'),
      fileName: () => 'unlock.latest.min.js',
      name: '@unlock-protocol/paywall',
      formats: ['umd'],
    },
  },
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
})
