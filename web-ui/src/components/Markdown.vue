<template>
  <div class="relative" v-html="output" />
</template>

<script setup lang="ts">
import MyWorker from '../utils/worker.js?worker'

const worker: Worker = new MyWorker()

const props = defineProps<{
  value: string
}>()

const emit = defineEmits(['loaded'])

const output = ref('Loading...')

watchEffect(() => {
  if (!props.value) return
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
    }
  })
})

onBeforeUnmount(() => {
  worker.terminate()
})
</script>

<style>
pre {
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
