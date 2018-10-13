module.exports = {
  setupTestFrameworkScriptFile: "<rootDir>/jest.setup.js",
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    "^.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest"
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$",
  ],
}
