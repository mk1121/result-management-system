// @ts-check
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['eslint.config.mjs', 'node_modules/**', 'dist/**', 'jest.config.js'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^err$' }],
    },
  },
  {
    files: ['__tests__/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {},
  },
];
