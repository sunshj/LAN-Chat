import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const resourceUiPath = path.join(process.cwd(), 'resources', 'ui')

const cliUiPath = path.join(process.cwd(), 'packages', 'cli/ui')
const vscodeUiPath = path.join(process.cwd(), 'packages', 'vscode/res/ui')

async function copy(resource, dist) {
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

const distPaths = [cliUiPath, vscodeUiPath]

Promise.all(distPaths.map(dist => copy(resourceUiPath, dist))).then(res => {
  console.log('copy done', res)
})
