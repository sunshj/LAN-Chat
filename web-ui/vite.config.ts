import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoImports from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    unocss(),
    autoImports({
      imports: ['vue', '@vueuse/core', 'pinia'],
      resolvers: [ElementPlusResolver()]
    }),
    components({
      directoryAsNamespace: true,
      resolvers: [ElementPlusResolver()]
    })
  ],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/socket.io/': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    emptyOutDir: false,
    outDir: '../resources/ui',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/element-plus')) return 'element-plus'
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
})
