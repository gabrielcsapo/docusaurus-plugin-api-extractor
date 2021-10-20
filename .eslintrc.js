module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 1,
  },
  overrides: [
    {
      files: ['packages/**/*.ts'],
      rules: {
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': 'off',
      },
    },
    {
      files: ['./packages/website/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
      env: {
        node: true,
      },
    },
  ],
};