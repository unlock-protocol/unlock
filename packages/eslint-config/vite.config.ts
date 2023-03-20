import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    dir: 'test',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    mockReset: false,
    environment: 'node',
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
    hookTimeout: 1000 * 60 * 5,
  },
})
