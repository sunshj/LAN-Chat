<template>
  <div ref="mdRef" class="md-output relative" @click.stop="handleClick" v-html="output" />
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
const appStore = useAppStore()
const fileStore = useFileStore()

const output = ref(props.value)
const errorMsg = ref('')
const isLoading = ref(false)

const { copy } = useClipboard({ legacy: true })

const mdRef = ref<HTMLDivElement | null>(null)

watchEffect(() => {
  if (!props.value) return
  isLoading.value = true

  if (appStore.initialScrolled) {
    useIntersectionObserver(mdRef, (entries, el) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !(entry.target as HTMLDivElement).dataset.render) {
          fileStore.setMarkdown(md => md.concat({ id: props.id, value: props.value }))
          el.unobserve(entry.target)
        }
      })

      $worker.emit('parse-markdown', toRaw(fileStore.markdown))
    })
  }
})

const unregisterParseMarkdownReply = $worker.on('parse-markdown-reply', payload => {
  if (mdRef.value && mdRef.value.dataset.render) return

  const data = payload.find(v => v.id === props.id)
  if (data?.error) errorMsg.value = data.error
  if (data?.value) {
    output.value = data.value
    fileStore.setMarkdown(md => md.filter(v => v.id !== props.id))
    mdRef.value?.setAttribute('data-render', 'true')
  }
  emit('loaded')
  isLoading.value = false
})

async function handleClick(e: Event) {
  const target = e.target as HTMLDivElement
  if ('lang' in target.dataset) {
    await copy(target.textContent!)
    ElMessage.success('Copied!')
  }
}

onUpdated(() => {
  document.querySelectorAll('.md-output a').forEach(el => {
    el.setAttribute('target', '_blank')
  })
})

onBeforeUnmount(() => {
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
  pointer-events: none;
}

.md-output pre.shiki::before {
  content: attr(data-lang);
  pointer-events: auto;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  text-transform: uppercase;
  color: #64778b;
  opacity: 0.2;
  padding: 4px;
  font-weight: bolder;
  z-index: 99;
}

.md-output pre.shiki:hover::before {
  content: 'Copy';
}
</style>
