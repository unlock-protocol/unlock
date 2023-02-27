import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    minify: !options.watch,
  }
})
