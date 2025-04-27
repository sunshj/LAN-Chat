import type { Directive } from 'vue'

interface OverlayOptions {
  visible: boolean
  text: string
  style?: CSSStyleDeclaration
  className?: string
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
    ol.className = `v-overlay ${options.className}`
    const defaultStyle = {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }

    Object.assign(ol.style, defaultStyle, options.style)

    ol.textContent = options.text
    el.style.position = 'relative'
    el.append(ol)
  }
}
