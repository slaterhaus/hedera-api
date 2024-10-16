const baseConfig = require('../eslint.base.config.js');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
