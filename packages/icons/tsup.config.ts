import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  format: 'esm',
  loader: {
    '.vue': 'copy'
  },
  dts: {
    entry: ['src/resolver.ts', 'src/nuxt.ts']
  },
  external: ['@nuxt/kit'],
  clean: true,
  shims: true,
  treeshake: true
})
