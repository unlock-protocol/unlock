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
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|tsx)$': [
      '<rootDir>/../node_modules/babel-jest', {
        presets: [
          'next/babel', 
          ["@babel/preset-env", { "modules": "auto" }]
        ],
        plugins: [
          '@babel/plugin-proposal-optional-chaining'
        ]
    }],
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['/node_modules/', 'src/stories/.*/*.stories.js'],
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(ethereum-cryptography)).+\\.(js|jsx|ts|tsx)$',
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
