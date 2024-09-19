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

export async function getMarkdownPlainText(value: string) {
  const htmlString = await marked(value)
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT)

  const textList = []
  let currentNode = walker.currentNode

  while (currentNode) {
    textList.push(currentNode.textContent)
    currentNode = walker.nextNode()!
  }

  return textList.filter(Boolean).join('')
}
