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
    '@typescript-eslint/camelcase': [0, 0],
    '@typescript-eslint/no-var-requires': [0, 0],
    'no-param-reassign': [0, 0],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "ts": "never",
      }
    ],
    'no-cond-assign': 0,
  },
};
