import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**/*',
      '**/lib/**/*',
      '**/node_modules/**/*',
      '**/*.tsbuildinfo',
      '**/*.d.ts',
      '**/public/**/*',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Add rules here
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  {
    name: 'js-only-rules',
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
      'no-undef': 'off', // caught by typescript
    },
  },
);
