module.exports = function(wallaby) {
  return {
    files: [
      'src/**/*.js',
      'jest.config.js',
      'jest.setup.js',
      'src/artifacts/**/*.json',

      '!src/server.js',
      '!src/_server.js',
      '!src/registerServiceWorker.js',
      '!src/stories/**/*.js',
      '!src/static/**/*.js',
      '!src/__tests__/**/*.js',
      'src/__mocks__/*',
    ],

    tests: ['src/__tests__/**/*.js'],

    env: {
      type: 'node',
      runner: 'node',
    },
    compilers: {
      '**/*.js': wallaby.compilers.babel(),
    },
    testFramework: 'jest',
    setup: function(wallaby) {
      var jestConfig = require('./jest.config.js')
      // for example:
      // jestConfig.globals = { "__DEV__": true };
      wallaby.testFramework.configure(jestConfig)
    },
  }
}
