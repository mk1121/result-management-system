// @ts-check
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['eslint.config.mjs', 'node_modules/**', 'dist/**'] },
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
];


