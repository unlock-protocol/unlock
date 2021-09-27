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
  moduleDirectories: [
    'node_modules',
    '<rootDir>/unlock-app/node_modules',
    '<rootDir>/unlock-app/src'
    ],
  moduleFileExtensions: [
    'js', 
    'jsx', 
    'ts', 
    'tsx', 
    'json'
  ],
  preset: 'ts-jest/presets/js-with-ts',
  globals: {
    'ts-jest': {
      babelConfig: {
        presets: [
          [
            "next/babel",
            {
              "preset-env": {
                "modules": "commonjs"
              }
            }
          ]
        ],
        plugins: [
          '@babel/plugin-proposal-optional-chaining',
          'require-context-hook'
        ]
      }
    }
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(ethereum-cryptography)).+\\.(js|jsx|ts|tsx)$',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/', 
    'src/stories/.*/*.stories.js'
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
