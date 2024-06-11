<template>
  <div
    v-overlay="{ visible: isLoading, text: 'Markdown 渲染中...' }"
    class="md-output relative"
    v-html="output"
  />
</template>

<script setup lang="ts">
import MyWorker from '../utils/worker.js?worker'
import { vOverlay } from '../../../src/shared'

const worker: Worker = new MyWorker()

const props = defineProps<{
  value: string
}>()

const emit = defineEmits(['loaded'])

const output = ref(props.value)
const isLoading = ref(false)

watchEffect(() => {
  if (!props.value) return

  isLoading.value = true
  worker.postMessage({
    type: 'markdown-parse',
    payload: props.value
  })
})

onMounted(() => {
  worker.addEventListener('message', event => {
    const { type, payload } = event.data
    if (type === 'markdown-parse-reply') {
      output.value = payload
      emit('loaded')
      isLoading.value = false
    }
  })
})

onBeforeUnmount(() => {
  worker.terminate()
})
</script>

<style>
.md-output {
  line-height: 24px;
}

.md-output ul {
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
