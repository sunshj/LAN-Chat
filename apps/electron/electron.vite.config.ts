import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import IconsResolver from 'lan-chat-icons/resolver'
import unocss from 'unocss/vite'
import autoImports from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ include: ['bufferutil', 'utf-8-validate'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('./src/renderer/src')
      }
    },
    plugins: [
      VueRouter({
        importMode: 'sync',
        routesFolder: './src/renderer/src/pages',
        dts: './src/renderer/types/router.d.ts'
      }),
      vue(),
      autoImports({
        dts: './types/imports.d.ts',
        imports: ['vue', '@vueuse/core', VueRouterAutoImports, 'pinia'],
        resolvers: [ElementPlusResolver()]
      }),
      components({
        dts: './types/components.d.ts',
        directoryAsNamespace: true,
        resolvers: [ElementPlusResolver(), IconsResolver()]
      }),
      unocss()
    ]
  }
})
