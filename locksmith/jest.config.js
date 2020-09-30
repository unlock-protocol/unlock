module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 75.0,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
