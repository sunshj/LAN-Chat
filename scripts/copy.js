import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const resourceUiPath = path.join(process.cwd(), 'resources', 'ui')
const cliUiPath = path.join(process.cwd(), 'packages', 'cli/ui')

if (fs.existsSync(cliUiPath)) {
  fs.rmSync(cliUiPath, {
    recursive: true
  })
}

fs.cpSync(resourceUiPath, cliUiPath, {
  recursive: true
})
