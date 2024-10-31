export function isMarkdownValue(value: string) {
  if (value.startsWith('---md\n')) return true
  if (value.startsWith('```')) return true
  if (URL.canParse(value)) return true
  return false
}

export function removeMarkdownSign(value: string) {
  if (value.startsWith('---md\n')) return value.replace(/^---md\n/, '')
  return value
}

export function generateMarkdownCodeBlock(language: string, code: string) {
  return `\`\`\`${language}\n${code}\n\`\`\``
}
