import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'c8',
      statements: 76,
      branches: 58,
      lines: 75,
      functions: 65,
    },
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '<rootDir>/.next/',
      '<rootDir>/node_modules/',
      '<rootDir>/src/__tests__/test-helpers/',
      '<rootDir>/build/',
      '<rootDir>/dist/',
    ],

    setupFiles: ['vitest-localstorage-mock', './src/__tests__/setup.js'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
    environment: 'jsdom',
  },
})
