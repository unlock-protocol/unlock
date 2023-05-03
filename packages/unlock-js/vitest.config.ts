import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      // inline: ['@tw-classed/react'],
    },
    globals: true,
    coverage: {
      provider: 'c8',
    },
    dir: 'src/__tests__',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 5 minute timeout
    testTimeout: 1000 * 60 * 5,
    exclude: ['hardhat.config.ts'],
    // optimizeDeps: {
    //   include: ['hardhat']

    // }
  },
})

// const base = require('@unlock-protocol/jest-config')

// module.exports = {
//   ...base,
//   testPathIgnorePatterns: [
//     '<rootDir>/lib/',
//     '<rootDir>/node_modules/',
//     '<rootDir>/src/__tests__/helpers/',
//     '<rootDir>/src/__tests__/setup/',
//     '<rootDir>/src/__tests__/integration/lock/',
//     '<rootDir>/src/__tests__/integration/unlock/',
//     '<rootDir>/src/__tests__/integration/single.js',
//   ],
//   transform: {
//     '^.+\\.js?$': require.resolve('./jest.transform.js'),
//   },
// }

/*
jest.transform.js
const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
}

module.exports = require('babel-jest').default.createTransformer(babelConfig)
*/
