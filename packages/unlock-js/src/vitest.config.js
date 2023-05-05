import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // needed to avoid "No test found in suite ..." in integration tests
    passWithNoTests: true,
  },
})
