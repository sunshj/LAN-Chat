import parser from 'ua-parser-js'
import type { Socket } from 'socket.io-client'

export const socketKey = Symbol('socket') as InjectionKey<Socket>

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

export function getOriginalFilename(filename: string) {
  return filename.slice(filename.indexOf('-') + 1)
}
