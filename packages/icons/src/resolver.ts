import { name as pkgName } from '../package.json'
import type { ComponentResolver } from 'unplugin-vue-components/types'

export default function IconsResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve(name) {
      if (!/^Icon[A-Z]/.test(name)) return
      return {
        name,
        from: pkgName
      }
    }
  }
}
