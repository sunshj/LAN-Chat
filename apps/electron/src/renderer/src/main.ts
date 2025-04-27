import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import 'virtual:uno.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const pinia = createPinia()

const app = createApp(App).use(router).use(pinia)

window.electron.ipcRenderer.on('navigate', (_, path) => {
  router.push(path)
})

app.mount('#app')
