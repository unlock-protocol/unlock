module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 77.42,
      functions: 82.76,
      lines: 91.63,
      statements: 91.63,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
