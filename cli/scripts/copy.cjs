const fs = require('node:fs')
const path = require('node:path')

const resourceUiPath = path.join(__dirname, '../../resources/ui')
const distUiPath = path.join(__dirname, '../ui')

if (fs.existsSync(distUiPath)) {
  fs.rmSync(distUiPath, { recursive: true })
}

fs.cpSync(resourceUiPath, distUiPath, { recursive: true })
