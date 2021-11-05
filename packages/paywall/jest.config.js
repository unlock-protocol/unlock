const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  setupFiles: ['<rootDir>/.jest/env.js', '<rootDir>/.jest/register-context.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMocks.js',
  },
  coverageThreshold: {
    global: {
      statements: 76,
      branches: 58,
      lines: 75,
      functions: 65,
    },
  },
  globals: {},
}
