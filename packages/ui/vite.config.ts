import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { peerDependencies, dependencies } from './package.json'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const isCDN = Boolean(process.env?.IS_CDN || false)

const external = [
  ...Object.keys(peerDependencies),
  ...Object.keys(dependencies),
]

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020', 'esnext'],
    outDir: isCDN ? 'dist/cdn' : 'dist',
    lib: {
      entry: path.resolve(__dirname, 'lib/index.tsx'),
      name: '@unlock-protocol/ui',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: isCDN ? Object.keys(peerDependencies) : external,
      shimMissingExports: true,
    },
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    svgr(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
})
