// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt'
  ],
  imports: {
    dirs: ['stores']
  },
  piniaPersistedstate: {
    storage: 'localStorage'
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
        prependPath: true,
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        prependPath: true,
        ws: true
      }
    },

    routeRules: {
      '/': {
        prerender: true
      },
      '/chat': {
        prerender: true
      }
    }
  }
})
