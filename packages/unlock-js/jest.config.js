const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/helpers/',
    '<rootDir>/src/__tests__/setup/',
    '<rootDir>/src/__tests__/integration/lock/',
    '<rootDir>/src/__tests__/integration/unlock/',
    '<rootDir>/src/__tests__/integration/single.js',
  ],
  transform: {
    '^.+\\.js?$': require.resolve('./jest.transform.js'),
  },
}
