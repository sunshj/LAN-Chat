import crypto from 'node:crypto'
import os from 'node:os'

export function isEmptyObj(obj: object) {
  return Object.keys(obj).length === 0
}

export function randomId(n = 16) {
  return crypto.randomBytes(16).toString('hex').slice(0, n)
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getNetworkAddresses() {
  return Object.values(os.networkInterfaces())
    .flatMap(nInterface => nInterface ?? [])
    .filter(
      detail =>
        detail &&
        detail.address &&
        (detail.family === 'IPv4' ||
          // @ts-expect-error Node 18.0 - 18.3 returns number
          detail.family === 4)
    )
    .map(v => v.address)
    .reverse()
}
