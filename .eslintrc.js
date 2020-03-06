module.exports = {
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'import/no-extraneous-dependencies': [2, { devDependencies: ['**/test.ts'] }],
    '@typescript-eslint/indent': [2, 2],
  },
};
