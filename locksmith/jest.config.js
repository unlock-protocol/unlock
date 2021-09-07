require('./src/utils/envLoader')

module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 63,
      functions: 73,
      lines: 75,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
