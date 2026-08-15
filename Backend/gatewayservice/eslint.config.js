import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['node_modules/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'no-unused-vars': 'warn',
      'prettier/prettier': 'error',
    },
  },
];
