export function isMarkdownValue(value: string) {
  if (value.startsWith('---md\n')) return true
  if (value.startsWith('```')) return true
  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (/(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{1,64})?\.)+[a-z]{2,6}\/?/.test(value))
    return true
  return false
}

export function removeMarkdownSign(value: string) {
  if (value.startsWith('---md\n')) return value.replace(/^---md\n/, '')
  return value
}

export function generateMarkdownCodeBlock(language: string, code: string) {
  return `\`\`\`${language}\n${code}\n\`\`\``
}
