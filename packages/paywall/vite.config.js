import path from 'path'
import { defineConfig } from 'vitest/config'
import { dependencies } from './package.json'
import tsconfigPaths from 'vite-tsconfig-paths'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  build: {
    target: ['es2020', 'esnext'],
    lib: {
      entry: 'src/index.ts',
      name: '@unlock-protocol/paywall',
      fileName: (format) => `unlock.latest.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(dependencies)],
      plugins: [tsconfigPaths()],
    },
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
    },
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
  },
  coverageThreshold: {
    global: {
      statements: 76,
      branches: 58,
      lines: 75,
      functions: 65,
    },
  },
  plugins: [cssInjectedByJsPlugin()],
})
