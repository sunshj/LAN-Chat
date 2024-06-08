const { defineConfig } = require('@sunshj/eslint-config')

module.exports = defineConfig([
  {
    rules: {
      'no-alert': 'off'
    }
  },
  {
    ignores: ['**/out', '**/resources', '**/drizzle']
  }
])
