import { defineConfig } from 'vitest/config'
import { esbuildDecorators } from '@anatine/esbuild-decorators'
import esbuildPluginTsc from 'esbuild-plugin-tsc'

export default defineConfig({
  test: {
    globals: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildPluginTsc(), esbuildDecorators()],
    },
  },
})
