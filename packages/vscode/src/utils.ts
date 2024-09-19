import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { defineLogger } from 'reactive-vscode'
import { displayName } from './generated/meta'

export const logger = defineLogger(displayName)

export function ensureFile(filepath: string, content?: string) {
  if (!existsSync(filepath)) {
    mkdirSync(path.dirname(filepath), { recursive: true })
    writeFileSync(filepath, content ?? '')
  }
  const file = readFileSync(filepath, 'utf8')
  if (!file.trim()) {
    writeFileSync(filepath, content ?? '')
  }
  return filepath
}

export function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

export function getWebviewContents(iframeUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            height: 100vh;
            padding: 0;
        }
    </style>
</head>
<body>
    <iframe src=${iframeUrl} width="100%" height="100%" frameborder="0" allow="fullscreen"></iframe>
</body>
</html>`
}
