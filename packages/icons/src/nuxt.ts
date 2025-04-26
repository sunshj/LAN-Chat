import { addComponentsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'lan-chat-icons'
  },
  setup() {
    const { resolve } = createResolver(import.meta.url)

    const componentsDir = resolve('./components')

    addComponentsDir({
      path: componentsDir,
      prefix: 'icon'
    })
  }
})
