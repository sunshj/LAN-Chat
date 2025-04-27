import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const packagesDir = path.join(process.cwd(), 'packages')
const appsDir = path.join(process.cwd(), 'apps')

const originalUiPath = path.join(packagesDir, 'web-ui/.output/public')
const electronUiPath = path.join(appsDir, 'electron/resources/ui')
const cliUiPath = path.join(appsDir, 'cli/ui')
const vscodeUiPath = path.join(appsDir, 'vscode/res/ui')

async function copy(resource: string, dist: string) {
  if (existsSync(dist)) {
    await fs.rm(dist, {
      recursive: true
    })
  }

  await fs.cp(resource, dist, {
    recursive: true
  })

  return dist
}

const distPaths = [electronUiPath, cliUiPath, vscodeUiPath]

Promise.all(distPaths.map(dist => copy(originalUiPath, dist))).then(res => {
  console.log('copy done', res)
})
