module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  root: true,
  plugins: ['jest', 'eslint-plugin-prettier', '@typescript-eslint'],
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
    'jest/no-disabled-tests': 'warn',
    'jest/no-identical-title': 'error',
    'jest/no-focused-tests': 'error',
    'jest/prefer-expect-assertions': 'error',
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
}
