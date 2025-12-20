import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import jest from 'eslint-plugin-jest';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url); // eslint-disable-line no-underscore-dangle
const __dirname = path.dirname(__filename); // eslint-disable-line no-underscore-dangle
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // globalIgnoresの代わりに、ignoresのみのオブジェクトを配列の先頭に置く
  {
    ignores: [
      '**/docs',
      '**/dest',
      '**/node_modules',
      'webpack.config.js',
    ],
  },
  ...fixupConfigRules(compat.extends(
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  )),
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      jest,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: Object.fromEntries(
        Object.entries({
          ...globals.browser,
          ...globals.jest,
          ...globals.node,
        }).map(([key, value]) => [key.trim(), value]),
      ),

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },

    rules: {
      'no-console': ['error', {
        allow: ['info', 'warn', 'error'],
      }],

      'import/extensions': ['error', 'ignorePackages', {
        ts: 'never',
        js: 'never',
      }],

      'import/prefer-default-export': 'off',
    },
  },
];
