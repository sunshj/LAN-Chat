<template>
  <div ref="mdRef" class="md-output" v-html="output" />
  <div
    v-if="isLoading"
    :class="[
      'w-full flex items-center gap-2 -bottom-6',
      {
        '-left-1': props.isSender,
        '-right-1 justify-end': !props.isSender
      }
    ]"
  >
    <IconSpinner />
    <span>rendering...</span>
  </div>
  <div v-if="errorMsg" class="mt-2 w-full text-center text-sm text-red-600">{{ errorMsg }}</div>
</template>

<script setup lang="ts">
const { $worker } = useNuxtApp()

const props = defineProps<{
  id: string
  value: string
  isSender: boolean
}>()

const emit = defineEmits(['loaded'])

const output = ref(props.value)
const errorMsg = ref('')
const isLoading = ref(false)

const { copy } = useClipboard({ legacy: true })

const mdRef = ref<HTMLDivElement | null>(null)

const observer = useIntersectionObserver(mdRef, (entries, el) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !(entry.target as HTMLDivElement).dataset.render) {
      isLoading.value = true
      $worker.emit('parse-markdown', { id: props.id, value: props.value })
      el.unobserve(entry.target)
    }
  })
})

const unregisterParseMarkdownReply = $worker.on('parse-markdown-reply', payload => {
  if (props.id !== payload.id) return
  if (mdRef.value && mdRef.value.dataset.render) return

  if (payload?.error) errorMsg.value = payload.error
  if (payload?.value) {
    output.value = payload.value
    mdRef.value?.setAttribute('data-render', 'true')
  }

  emit('loaded')
  isLoading.value = false

  nextTick(() => {
    renderCodeCopyButton()
  })
})

function renderCodeCopyButton() {
  if (!mdRef.value) return

  mdRef.value.querySelectorAll<HTMLPreElement>('pre[data-lang]').forEach(el => {
    const lang = (el.dataset.lang as string).toUpperCase()

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

    copyBtn.textContent = lang
    copyBtn.addEventListener('click', () => {
      copy(el.querySelector('code')!.textContent!)
      ElMessage.success('Copied!')
    })

    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.textContent = 'COPY'
      copyBtn.style.opacity = '0.5'
    })

    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.textContent = lang
      copyBtn.style.opacity = copyBtnStyle.opacity
    })

    el.append(copyBtn)
  })
}

onUpdated(() => {
  document.querySelectorAll('.md-output a').forEach(el => {
    el.setAttribute('target', '_blank')
  })
})

onBeforeUnmount(() => {
  observer.stop()
  unregisterParseMarkdownReply()
})
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
