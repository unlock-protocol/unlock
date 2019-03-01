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
      branches: 76.39,
      functions: 79.09,
      lines: 87.37,
      statements: 86.36,
    },
  },
}
