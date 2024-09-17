import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  shims: true,
  format: 'esm',
  treeshake: true
})
