module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  globals: {
    it: true,
    describe: true,
    before: true,
    beforeEach: true,
    after: true,
    afterEach: true,
  },
}
