import { execSync } from 'node:child_process'

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  sourcemap: false,

  srcDir: './app',

  app: {
    head: {
      title: 'LAN Chat'
    }
  },

  experimental: {
    payloadExtraction: false
  },

  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/mdc'
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

  imports: {
    dirs: ['./app/stores']
  },

  mdc: {
    highlight: {},
    headings: {
      anchorLinks: false
    },
    components: {
      prose: true
    }
  },

  elementPlus: {
    icon: false
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

    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('shiki/dist/langs')) return 'shiki-langs'
          }
        }
      }
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
      routes: ['/', '/chat', '/chat/group', '/404.html']
    },

    sourceMap: false
  }
})
