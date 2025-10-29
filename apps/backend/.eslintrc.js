module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console.log in backend
    'import/extensions': 'off', // Allow imports without extensions
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules/', 'test-integration.js'],
};
