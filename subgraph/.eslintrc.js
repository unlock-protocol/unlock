module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    // TODO: fix the functions this triggers
    'consistent-return': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
}
