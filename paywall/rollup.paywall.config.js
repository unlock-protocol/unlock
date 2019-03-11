/* eslint-disable import/no-extraneous-dependencies */
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

const config = {
  input: 'src/paywall-builder/index.js',
  output: {
    format: 'umd',
    name: 'paywall.min.js',
  },
  plugins: [
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true,
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
  ],
}

export default config
