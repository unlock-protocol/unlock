module.exports = {
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/helpers/',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
