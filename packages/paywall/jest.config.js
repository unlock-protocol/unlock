module.exports = {
  setupFiles: ['<rootDir>/.jest/env.js', '<rootDir>/.jest/register-context.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/test-helpers/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
  ],
  preset: 'ts-jest/presets/js-with-ts',
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMocks.js',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 77,
      branches: 58,
      lines: 76,
      functions: 65,
    },
  },
  globals: {
    PAYWALL_URL: 'localhost',
    __ENVIRONMENT_VARIABLES__: {
      locksmithUri: 'http://0.0.0.0:8080',
    },
  },
}
