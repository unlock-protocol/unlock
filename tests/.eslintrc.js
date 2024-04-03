const rulesToIgnore = [
  'import/extensions',
  'no-param-reassign',
  'import/no-extraneous-dependencies',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
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
    ...rulesToIgnore.reduce((obj, rule) => ({ ...obj, [rule]: 'off' }), {}),
  },
}
