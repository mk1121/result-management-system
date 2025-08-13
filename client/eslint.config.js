// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: new URL('.', import.meta.url).pathname });

export default [
  { ignores: ['node_modules/**', 'dist/**', 'eslint.config.js'] },
  js.configs.recommended,
  ...compat.extends('plugin:react/recommended'),
  {
    files: ['src/**/*.{js,jsx}'],
    settings: { react: { version: 'detect' } },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    plugins: { react: pluginReact },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn'],
    },
  },
  {
    files: ['src/**/__tests__/**/*.{js,jsx}', 'src/**/*.{test,spec}.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        describe: true,
        it: true,
        test: true,
        expect: true,
        vi: true,
        beforeEach: true,
        beforeAll: true,
        afterAll: true,
        global: true,
      },
    },
    rules: {},
  },
];


