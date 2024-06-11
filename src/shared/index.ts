import type { Directive } from 'vue'

interface OverlayOptions {
  visible: boolean
  text: string
  color?: string
  backgroundColor?: string
}

export const vOverlay: Directive<HTMLElement, boolean | OverlayOptions> = (el, binding) => {
  const options =
    typeof binding.value === 'boolean'
      ? { visible: binding.value, text: 'Loading...' }
      : binding.value

  const overlay = el.querySelector<HTMLDivElement>('.v-overlay')

  if (overlay) {
    overlay.textContent = options.text
    overlay.style.display = options.visible ? 'flex' : 'none'
  } else {
    const ol = document.createElement('div')
    ol.className = 'v-overlay'
    ol.style.position = 'absolute'
    ol.style.inset = '0'
    ol.style.width = '100%'
    ol.style.height = '100%'
    ol.style.display = options.visible ? 'flex' : 'none'
    ol.style.justifyContent = 'center'
    ol.style.alignItems = 'center'
    ol.style.color = options.color ?? 'black'
    ol.style.backgroundColor = options.backgroundColor ?? 'rgba(255, 255, 255, 0.9)'

    ol.textContent = options.text
    el.style.position = 'relative'
    el.append(ol)
  }
}
