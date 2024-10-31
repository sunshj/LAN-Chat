<template>
  <pre :class="$props.class">
    <span  class="copy-btn" @click="copy($props.code!)">{{ $props.language }}</span>
    <slot />
</pre>
</template>

<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  },
  meta: {
    type: String,
    default: null
  },
  class: {
    type: String,
    default: null
  }
})

const { copy, copied } = useClipboard({ legacy: true })

watchEffect(() => {
  if (copied.value) {
    ElMessage.success('copied')
  }
})
</script>

<style>
pre.shiki > code {
  display: block;
  margin-top: -2em;
}

pre.shiki code .line {
  display: block;
}

pre.shiki {
  font-size: 14px;
  line-height: 1.5em;
  background-color: #f2f3f4 !important;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  position: relative;
}

.copy-btn {
  position: absolute;
  inset: 0 0 auto auto;
  z-index: 100;
  cursor: pointer;
  padding: 6px;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: bold;
  color: #64778b;
  opacity: 0.2;
  transition: all 0.2s ease-in-out;
}

.copy-btn:hover {
  opacity: 1 !important;
}
</style>
