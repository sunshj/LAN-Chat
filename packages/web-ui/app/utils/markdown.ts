import { marked, type TokensList } from 'marked'

export function isMarkdownValue(value: string) {
  function containsNonTextTokens(tokens: TokensList) {
    return tokens.some(token => {
      if (token.type !== 'text' && token.type !== 'paragraph') return true
      // @ts-expect-error
      if (token.tokens && containsNonTextTokens(token.tokens)) return true
      return false
    })
  }
  const tokens = marked.lexer(value)
  return containsNonTextTokens(tokens)
}

export function generateMarkdownCodeBlock(language: string, code: string) {
  return `\`\`\`${language}\n${code}\n\`\`\``
}
