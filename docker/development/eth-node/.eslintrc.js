const rulesToIgnore = []

module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    ...rulesToIgnore.reduce((obj, rule) => ({ ...obj, [rule]: 'off' }), {}),
  },
}
