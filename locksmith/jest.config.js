require('./src/utils/envLoader')
require('setimmediate') // attach to global scope

module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 63,
      functions: 73,
      lines: 75,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
