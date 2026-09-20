const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/**', 'prisma/**'] },
  prettier,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs', globals: { process: 'readonly', module: 'readonly', require: 'readonly', __dirname: 'readonly' } },
    rules: {},
  },
  { files: ['tests/**/*.js'], languageOptions: { globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly' } } },
];
