module.exports = {
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}
