import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'c8',
    },
    dir: 'test',
    include: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 100000,
  },
})
