module.exports = {
  collectCoverage: true,
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/helpers/',
    '<rootDir>/src/__tests__/setup/',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
