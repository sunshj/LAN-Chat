<template>
  <div ref="mdRef" class="md-output relative" v-html="output" />
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
const { $mdWorker } = useNuxtApp()

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

      $mdWorker.postMessage(createWorkerMessage('markdownParse', toRaw(fileStore.markdown)))
    })
  }
})

function handleMarkdownParseReply(event: MessageEvent) {
  const { type, payload } = extractWorkerData(event)

  if (type === 'markdownParseReply') {
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
  }
}

onMounted(() => {
  $mdWorker.addEventListener('message', handleMarkdownParseReply)
})

onUpdated(() => {
  document.querySelectorAll('.md-output a').forEach(el => {
    el.setAttribute('target', '_blank')
  })
})

onBeforeUnmount(() => {
  $mdWorker.removeEventListener('message', handleMarkdownParseReply)
})
</script>

<style>
.md-output {
  line-height: 24px;
}

.md-output h1,
h2,
h3,
h4,
h5,
h6 {
  line-height: 1.5em;
}

.md-output li {
  list-style-position: inside;
}

.md-output pre {
  font-size: 14px;
}

pre.shiki {
  background-color: #f2f3f4 !important;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 6px 0;
}

pre.shiki:hover::before {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  text-transform: uppercase;
  color: white;
  padding: 4px;
  border-bottom-left-radius: 4px;
  background-color: #0006;
  font-weight: bolder;
}
</style>
