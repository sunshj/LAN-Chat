import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  sourcemap: false,

  app: {
    head: {
      title: 'LAN Chat'
    }
  },

  experimental: {
    payloadExtraction: false
  },

  runtimeConfig: {
    public: {
      WS_URL: process.env.NODE_ENV === 'development' ? 'ws://127.0.0.1:3000' : '/'
    }
  },

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt'
  ],

  devServer: {
    port: 8080,
    host: '0.0.0.0'
  },

  imports: {
    dirs: ['stores']
  },

  elementPlus: {
    icon: false
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage'
  },

  vite: {
    worker: {
      format: 'es'
    }
  },

  nitro: {
    experimental: {
      websocket: true
    },
    preset: 'static',
    output: {
      publicDir: '../../resources/ui'
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
    },

    sourceMap: false
  }
})
