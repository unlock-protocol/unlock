module.exports = {
  extends: ['@unlock-protocol/eslint-config'],
  rules: {
    // note you must disable the base rule as it can report incorrect errors
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-nested-ternary': 'off',
    'react/no-invalid-html-attribute': 'off',
    'react/function-component-definition': 'off',
  },
}
