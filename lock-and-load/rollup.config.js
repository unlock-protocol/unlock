import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

const config = {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'paywall.js'
  },
  plugins: [
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true,
    }),
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  ]
}

export default config
