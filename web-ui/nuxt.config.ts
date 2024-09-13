// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'LAN Chat'
    }
  },
  sourcemap: false,
  devtools: { enabled: false },
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt'
  ],
  imports: {
    dirs: ['stores']
  },
  experimental: {
    payloadExtraction: false
  },
  elementPlus: {
    icon: false
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage'
  },
  websocketProxy: {
    target: 'http://127.0.0.1:3000',
    path: '/socket.io'
  },

  vite: {
    worker: {
      format: 'es'
    }
  },

  devServer: {
    port: 8080,
    host: '0.0.0.0'
  },

  nitro: {
    experimental: {
      websocket: true
    },
    preset: 'static',
    output: {
      publicDir: '../resources/ui'
    },

    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:3000/api',
        changeOrigin: true
      }
    },

    prerender: {
      crawlLinks: true,
      routes: ['/', '/chat', '/404.html']
    }
  }
})
