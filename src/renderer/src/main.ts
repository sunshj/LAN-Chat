import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import 'virtual:uno.css'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
