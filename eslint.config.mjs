import merge from '@sequencemedia/eslint-config-standard/merge'
import parser from '@babel/eslint-parser'
import globals from 'globals'

export default (
  merge({
    files: [
      '**/*.{cjs,mjs}'
    ],
    ignores: [
      'test'
    ],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    }
  })
    .concat(
      merge({
        files: [
          'test/**/*.{cjs,mjs}'
        ],
        languageOptions: {
          parser,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
          },
          globals: {
            ...globals.mocha
          }
        }
      })
        .concat({
          rules: {
            'no-unused-expressions': 'off'
          }
        })
    )
)
