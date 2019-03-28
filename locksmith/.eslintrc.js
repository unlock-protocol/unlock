module.exports = {
  extends: [
    'standard',
    'airbnb-base',
    'eslint:recommended',
    'prettier',
    'prettier/standard',
    'plugin:prettier/recommended',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  plugins: ['jest', 'mocha', 'promise', 'import', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {},
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': ['error', 'unix'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
    'brace-style': 0,
    indent: 0, // this conflicts with prettier and is not needed
    'mocha/no-exclusive-tests': 'error',
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'standard/computed-property-even-spacing': 0,
    'standard/object-curly-even-spacing': 0,
    'standard/array-bracket-even-spacing': 0,
    'promise/prefer-await-to-then': 'warn',
    'jest/no-disabled-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/no-focused-tests': 'warn',
    'jest/prefer-expect-assertions': 'error',
    'eol-last': ['error'],
  },
}
