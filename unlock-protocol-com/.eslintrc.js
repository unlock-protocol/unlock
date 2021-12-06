module.exports = {
  extends: ['@unlock-protocol/eslint-config', 'plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-use-before-define': 0,
    'no-underscore-dangle': 0,
    'react/forbid-prop-types': 2,
    'react/jsx-no-constructed-context-values': 'warn',
    'react/no-invalid-html-attribute': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
    'react/jsx-filename-extension': [0, { extensions: ['.js', '.jsx'] }],
  },
}
