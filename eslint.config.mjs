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
      // Use 'stroustrup' style but allow 'catch' and 'finally' on the same line as the closing bracket
      'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
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