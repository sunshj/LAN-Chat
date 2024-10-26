<template>
  <div ref="mdRef" class="md-output" v-html="code" />
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
  value: string
  isSender: boolean
}>()

const mdRef = ref<HTMLDivElement | null>(null)
const { $md } = useNuxtApp()

const code = computed(() => $md.render(removeMarkdownSign(props.value)))

watchPostEffect(() => {
  if (code.value) {
    renderCodeCopyButton()
    renderLink()
  }
})

const { copy } = useClipboard({ legacy: true })

function renderCodeCopyButton() {
  if (!mdRef.value) return

  mdRef.value.querySelectorAll<HTMLPreElement>('pre.shiki').forEach(el => {
    const [, lang] = el.querySelector('code')?.className.split('-') || []

    const copyBtn = document.createElement('span')
    const copyBtnStyle = {
      position: 'absolute',
      inset: '0 0 auto auto',
      padding: '4px',
      color: '#64778b',
      opacity: '0.2',
      fontSize: '16px',
      fontWeight: 'bolder',
      cursor: 'pointer'
    }

    Object.assign(copyBtn.style, copyBtnStyle)

    copyBtn.textContent = lang.toUpperCase()
    copyBtn.addEventListener('click', () => {
      copy(el.querySelector('code')!.textContent!)
      ElMessage.success('Copied!')
    })

    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.textContent = 'COPY'
      copyBtn.style.opacity = '0.5'
    })

    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.textContent = lang.toUpperCase()
      copyBtn.style.opacity = copyBtnStyle.opacity
    })

    el.append(copyBtn)
  })
}

function renderLink() {
  if (!mdRef.value) return

  mdRef.value.querySelectorAll<HTMLAnchorElement>('a').forEach(el => {
    el.setAttribute('target', '_blank')
  })
}
</script>

<style>
.md-output {
  line-height: 2em;
}

.md-output table,
th,
td {
  border: 1px solid #585865;
  border-collapse: collapse;
  padding: 2px;
}

.md-output li {
  list-style-position: inside;
}

.md-output code:not(pre code) {
  font-size: 14px;
  box-sizing: border-box;
  padding: 2px;
  color: #585865;
  word-wrap: break-word;
  background: #0066cc26;
  border: 1px solid #2994ff;
  border-radius: 4px;
}

.md-output pre {
  font-size: 14px;
  line-height: 1.5em;
  background-color: #f2f3f4 !important;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 6px 0;
  position: relative;
}
</style>
