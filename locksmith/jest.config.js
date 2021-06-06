require('./src/utils/envLoader')

module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 69,
      functions: 75,
      lines: 80,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
