import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-0-0-auto': 'flex-grow-0 flex-shrink-0 flex-basis-auto'
  }
})
