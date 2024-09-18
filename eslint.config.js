import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig([
  {
    rules: {
      'no-alert': 'off',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false }
      ]
    }
  },
  {
    ignores: ['**/out', '**/resources']
  }
])
