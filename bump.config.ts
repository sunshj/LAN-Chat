import { defineConfig } from 'bumpp'

export default defineConfig({
  files: [
    './apps/electron/package.json',
    './apps/cli/package.json',
    './apps/vscode/package.json',
    './packages/server/package.json'
  ]
})
