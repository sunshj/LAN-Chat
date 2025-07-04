import { execSync } from 'node:child_process'

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  sourcemap: false,

  future: {
    compatibilityVersion: 4
  },

  app: {
    head: {
      title: 'LAN Chat'
    }
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  modules: [
    '@sunshj/mdc',
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt',
    'lan-chat-icons/nuxt'
  ],

  runtimeConfig: {
    public: {
      buildTime: Date.now(),
      gitSha: execSync('git rev-parse HEAD').toString().trim(),
      repoUrl: 'https://github.com/sunshj/LAN-Chat'
    }
  },

  $development: {
    runtimeConfig: {
      public: {
        wsUrl: 'ws://127.0.0.1:3000'
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        wsUrl: '/'
      }
    }
  },

  devServer: {
    port: 8080
  },

  mdc: {
    highlight: {
      theme: 'github-light-default'
    },
    headings: {
      anchorLinks: false
    }
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage'
  },

  vite: {
    server: {
      hmr: {
        clientPort: 8080
      }
    },

    optimizeDeps: {
      include: ['debug']
    }
  },

  nitro: {
    experimental: {
      websocket: true
    },

    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:3000/api',
        changeOrigin: true
      }
    },

    sourceMap: false
  },

  compatibilityDate: '2024-11-01'
})
