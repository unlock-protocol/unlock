module.exports = {
  setupFiles: ['<rootDir>/.jest/register-context.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 85.2,
      functions: 88.92,
      lines: 95.3,
      statements: -137,
    },
  },
}
