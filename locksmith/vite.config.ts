import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      inline: ['@tw-classed/react'],
    },
    globals: true,
    coverage: {
      provider: 'c8',
    },
    dir: '__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
  },
})
