const rulesToIgnore = [
  'import/extensions',
  'no-param-reassign',
  'import/no-extraneous-dependencies',
]

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    ...rulesToIgnore.reduce((obj, rule) => ({ ...obj, [rule]: 'off' }), {}),
  },
}
