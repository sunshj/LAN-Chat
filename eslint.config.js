import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig([
  {
    rules: {
      'no-alert': 'off'
    }
  },
  {
    ignores: ['**/out', '**/resources']
  }
])
