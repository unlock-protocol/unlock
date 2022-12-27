import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'c8',
    },
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
    setupFiles: ['vitest-localstorage-mock'],
    mockReset: false,
  },
})
