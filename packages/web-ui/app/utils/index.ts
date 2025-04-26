import parser from 'ua-parser-js'

export const GROUP_CHAT_ID = 'group'

export function getStartingPrefix<T>(
  str: string,
  prefixes: T[] | string[],
  getter?: (item: T) => string
) {
  for (const [i, item] of prefixes.entries()) {
    let prefix: string

    if (typeof item === 'string') {
      prefix = item
    } else {
      if (!getter) {
        throw new Error('Getter function is required when prefixes is an object array')
      }
      prefix = getter(item as T)
    }

    if (str.startsWith(prefix)) {
      return {
        matched: prefix,
        item: item as T,
        index: i
      }
    }
  }

  return null
}

export function getDeviceName(ua: string) {
  const { os, browser } = parser(ua)
  const osName = os.name?.replace('macOS', 'Mac').replace('Windows', 'Win') ?? ''
  const version = os.version ?? ''
  const browserName = browser.name

  return `${osName} ${version} ${browserName}`
}

export function randomId(n = 6) {
  return Math.random().toString(32).slice(n)
}

export function getMessageType(mimetype: string): MessageType {
  if (mimetype.includes('image')) return 'image'
  if (mimetype.includes('video')) return 'video'
  if (mimetype.includes('audio')) return 'audio'
  return 'file'
}

export function unique<T, K extends keyof T>(array: T[], getKey?: K | ((item: T) => T[K])) {
  const result: T[] = []
  const keys = new Set()

  array.forEach(item => {
    const key = getKey ? (typeof getKey === 'function' ? getKey(item) : item[getKey]) : item
    if (!keys.has(key)) {
      keys.add(key)
      result.push(item)
    }
  })

  return result
}

export function withResolvers<T>() {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!
  }
}
