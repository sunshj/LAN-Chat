import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig(
  [
    {
      rules: {
        'no-alert': 'off'
      }
    },
    {
      ignores: ['apps/electron/src/renderer/types']
    }
  ],
  { vue: true, unocss: true }
)
