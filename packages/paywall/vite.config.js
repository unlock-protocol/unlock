import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'c8',
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
})
