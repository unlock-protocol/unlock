const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/helpers/',
    '<rootDir>/src/__tests__/setup/',
  ],
  transform: {
    '^.+\\.js?$': require.resolve('./jest.transform.js'),
  },
}
