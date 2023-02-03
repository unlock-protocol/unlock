module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:json/recommended',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: false,
  },
  root: true,
  plugins: [
    'vitest',
    'eslint-plugin-prettier',
    'eslint-plugin-mocha',
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  settings: {
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
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    'brace-style': 0,
    'no-constant-condition': 0,
    'no-promise-executor-return': 0,
    'vitest/no-disabled-tests': 'warn',
    'vitest/no-identical-title': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/prefer-expect-assertions': 'error',
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
}
