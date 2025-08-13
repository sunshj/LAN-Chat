import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig(
  [
    {
      rules: {
        'no-alert': 'off'
      }
    },
    {
      files: ['apps/electron/src/main/ipc.ts'],
      rules: {
        'require-await': 'off'
      }
    },
    {
      ignores: ['apps/electron/src/renderer/types']
    }
  ],
  { vue: true, unocss: true, react: false }
)
