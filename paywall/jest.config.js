module.exports = {
  setupFiles: ['<rootDir>/.jest/env.js', '<rootDir>/.jest/register-context.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMocks.js',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 82.99,
      branches: 59.02,
      lines: 82.42,
      functions: 78.69,
    },
  },
  globals: {
    PAYWALL_URL: 'localhost',
    __ENVIRONMENT_VARIABLES__: {
      locksmithUri: 'http://0.0.0.0:8080',
    },
  },
}
