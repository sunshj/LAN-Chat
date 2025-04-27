const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

/** @type {import("electron-builder").Configuration['afterPack']} */
module.exports = context => {
  if (process.platform === 'darwin') return
  const unpackedDir = path.join(context.appOutDir, 'locales')

  // 删除除 zh-CN.pak 之外的所有文件
  const files = fs.readdirSync(unpackedDir)
  for (const file of files) {
    if (!file.endsWith('zh-CN.pak')) {
      fs.rmSync(path.join(unpackedDir, file))
    }
  }

  // 删除特定的文件
  const filesToDelete = ['LICENSE.electron.txt', 'LICENSES.chromium.html']
  for (const fileName of filesToDelete) {
    const filePath = path.join(context.appOutDir, fileName)
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath)
    }
  }
}
