const base = require('@unlock-protocol/jest-config')

module.exports = {
  ...base,
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
  moduleDirectories: [
    'node_modules',
    '<rootDir>/unlock-app/node_modules',
    '<rootDir>/unlock-app/src',
  ],
  globals: {
    'ts-jest': {
      tsconfig: "./tsconfig.test.json",
      babelConfig: {
        presets: [
          [
            'next/babel',
            {
              'preset-env': {
                modules: 'commonjs',
              },
            },
          ],
        ],
        plugins: [
          '@babel/plugin-proposal-optional-chaining',
          'require-context-hook',
        ],
      },
    },
  },
  coveragePathIgnorePatterns: ['src/stories/.*/*.stories.js'],
  coverageThreshold: {
    global: {
      branches: 54,
      functions: 42,
      lines: 60,
      statements: 58,
    },
  },
}
