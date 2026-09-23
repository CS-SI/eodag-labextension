import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

const sourceFiles = ['src/**/*.{ts,tsx}'];

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      '.venv',
      'dist',
      'coverage',
      '**/*.d.ts',
      'lib',
      'eodag_labextension/labextension'
    ]
  },
  {
    ...js.configs.recommended,
    files: sourceFiles
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: sourceFiles
  })),
  prettierRecommended,
  {
    files: sourceFiles,
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true
          }
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false
        }
      ],
      curly: ['error', 'all'],
      eqeqeq: 'error',
      'prefer-arrow-callback': 'error'
    }
  }
);
