import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// 清空resources/uploads目录: 只清理文件，保留uploads目录和.gitkeep
const uploadsDir = path.join(process.cwd(), 'resources', 'uploads')
const aliveFiles = ['.gitkeep', 'THIS_FILE_SHOULD_NOT_BE_DELETED']

function ensureFile(file) {
  const filePath = path.join(file)
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '')
  return filePath
}

aliveFiles.forEach(file => ensureFile(path.join(uploadsDir, file)))

fs.readdirSync(uploadsDir).forEach(file => {
  if (!aliveFiles.includes(file)) {
    fs.unlinkSync(path.join(uploadsDir, file))
  }
})
