const fs = require('node:fs')
const path = require('node:path')

const srcDir = path.resolve(__dirname, '../src')
const componentsDir = path.resolve(srcDir, 'components')
const entryFile = path.resolve(srcDir, 'index.ts')
const components = fs.readdirSync(componentsDir).map(component => component.replace(/.vue$/, ''))

function generate() {
  const entryContent = components
    .map(component => `export { default as Icon${component} } from './components/${component}.vue'`)
    .join('\n')

  fs.writeFileSync(entryFile, `${entryContent}\n`)
}

function generateDTS() {
  const dtsContent = components
    .map(component => `export declare const Icon${component}: Component`)
    .join('\n')

  const importDeclare = `import type { Component } from 'vue'
`

  fs.writeFileSync(path.resolve(srcDir, '../index.d.ts'), `${importDeclare}\n${dtsContent}\n`)
}

generate()
generateDTS()
