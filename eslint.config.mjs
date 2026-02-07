import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';


export default [
  nextPlugin.configs['core-web-vitals'],
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ['error', 'single'],
      curly: ['error', 'all'],
      'comma-dangle': ['error', 'always-multiline'],
      'brace-style': ['error', 'stroustrup'],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
];