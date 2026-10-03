import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.output/**',
      '.tanstack/**',
      'dist/**',
      'src/routeTree.gen.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['pg', '**/*.server', '@tanstack/*', 'react', 'node:*'] },
      ],
    },
  },
  {
    files: ['src/modules/*/repository.server.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['pg', 'react', '@tanstack/*', '**/routes/**'] },
      ],
    },
  },
  {
    files: ['src/modules/*/*.functions.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['pg', 'react', '**/routes/**'] }],
    },
  },
  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['pg', 'node:*', '**/db.server', '**/repository.server'] },
      ],
    },
  },
  {
    files: ['src/server/**/*.ts'],
    ignores: ['src/server/database.server.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['pg'] }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/server/env.server.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use getEnv() from src/server/env.server.ts in application code.',
        },
      ],
    },
  },
)
