import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    deps: {
      inline: ['@tw-classed/react'],
    },
    globals: true,
    coverage: {
      provider: 'c8',
      enabled: true,
      branches: 26,
      functions: 34,
      lines: 55,
      statements: 57,
    },
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
    hookTimeout: 1000 * 60 * 5,
    setupFiles: ['vitest-localstorage-mock', './src/__tests__/setup.js'],
    mockReset: false,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
