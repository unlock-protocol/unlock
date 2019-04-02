module.exports = {
  extends: ['../.eslintrc.js'],
  plugins: ['mocha'],
  globals: {
    it: true,
    artifacts: true,
    contract: true,
    describe: true,
    before: true,
    beforeEach: true,
    web3: true,
    assert: true,
    abi: true,
    after: true,
    afterEach: true,
  },
  rules: {
    'mocha/no-exclusive-tests': 'error',
    'jest/prefer-expect-assertions': 0, // Smart contract tests are using mocha...
  },
}
