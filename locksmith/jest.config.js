module.exports = {
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-helpers/'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 74,
      functions: 79,
      lines: 84,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
}
