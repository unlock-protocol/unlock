import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    clearMocks: true,
    environment: 'node',
    testTimeout: 1000 * 30,
    hookTimeout: 1000 * 30,
    setupFiles: ['./src/__tests__/setup.js'],
    deps: {
      inline: ['@unlock-protocol/email-templates', 'worker-mailer'],
    },
  },
})
