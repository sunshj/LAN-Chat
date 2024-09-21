import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  shims: true,
  treeshake: true
})
