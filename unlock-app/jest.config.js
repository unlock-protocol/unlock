module.exports = {
  setupFiles: [
    '<rootDir>/.jest/env.js',
    '<rootDir>/.jest/register-context.js',
    'jest-canvas-mock',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
  ],
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|tsx)$': ['<rootDir>/../node_modules/babel-jest', {
      presets: ['next/babel'],
      plugins: ['@babel/plugin-proposal-optional-chaining']
    }],
    '^.+\\.(ts)$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['/node_modules/', 'src/stories/.*/*.stories.js'],
  transformIgnorePatterns: [
    "/node_modules/(?!ethereum-cryptography)",
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 43,
      lines: 60,
      statements: 58,
    },
  }
}
