import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { peerDependencies, dependencies } from './package.json'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020', 'esnext'],
    lib: {
      entry: path.resolve(__dirname, 'lib/index.tsx'),
      name: '@unlock-protocol/ui',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...Object.keys(peerDependencies),
        ...Object.keys(dependencies),
      ],
    },
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    svgr({
      exportAsDefault: true,
      exclude: ['lib/assets/*.svg'],
    }),
  ],
})
