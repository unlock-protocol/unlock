// ABOUTME: Vitest configuration for governance-app unit tests.
// ABOUTME: Resolves the ~ path alias (pointing to src/) used throughout the app.
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
  },
})
