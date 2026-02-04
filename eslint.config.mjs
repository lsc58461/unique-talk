import path from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import { configs, plugins } from 'eslint-config-airbnb-extended'
import { rules as prettierConfigRules } from 'eslint-config-prettier'
import jsoncPlugin from 'eslint-plugin-jsonc'
import prettierPlugin from 'eslint-plugin-prettier'

const gitignorePath = path.resolve('.', '.gitignore')

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
])

const nextConfig = defineConfig([
  // React plugin
  plugins.react,
  // React hooks plugin
  plugins.reactHooks,
  // React JSX A11y plugin
  plugins.reactA11y,
  // Next.js plugin
  plugins.next,
  // Airbnb Next.js recommended config
  ...configs.next.recommended,
])

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  // Airbnb Next.js TypeScript config
  ...configs.next.typescript,
])

const prettierConfig = defineConfig([
  // Prettier plugin
  {
    name: 'prettier/plugin/config',
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier config
  {
    name: 'prettier/config',
    rules: {
      ...prettierConfigRules,
      'prettier/prettier': 'error',
    },
  },
])

const jsoncConfig = defineConfig([
  // JSONC Plugin
  ...jsoncPlugin.configs['flat/recommended-with-jsonc'],
  {
    name: 'jsonc/custom-rules',
    files: ['**/*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
])

const customConfig = defineConfig([
  {
    name: 'custom/rules',
    ignores: ['**/*.json'],
    rules: {
      semi: 'off',
      'import-x/prefer-default-export': 'off',
      'arrow-body-style': 'off',
      'import-x/no-cycle': 'off',
      'no-console': [
        'error',
        { allow: ['warn', 'error', 'info', 'table', 'trace'] },
      ],
      'react/require-default-props': 'off',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin', // node 내장 모듈
            'external', // npm 패키지
            'internal', // 내부 alias (예: @/shared/utils)
            'parent', // ../
            'sibling', // ./
            'index', // index 파일
          ],
          'newlines-between': 'always', // 그룹 간 한 줄 띄우기
          alphabetize: { order: 'asc', caseInsensitive: true }, // 알파벳순 정렬
        },
      ],
      'import-x/no-extraneous-dependencies': 'off',
      'no-useless-catch': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },
])

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // JavaScript config
  ...jsConfig,
  // Next.js config
  ...nextConfig,
  // TypeScript config
  ...typescriptConfig,
  // Prettier config
  ...prettierConfig,
  // JSONC config
  ...jsoncConfig,
  // Custom config
  ...customConfig,
])
