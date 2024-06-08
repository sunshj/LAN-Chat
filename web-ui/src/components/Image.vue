<template>
  <el-image
    fit="cover"
    :src="props.thumbnail || props.url"
    class="aspect-ratio h-40 cursor-pointer"
    loading="lazy"
    :preview-src-list="[props.url]"
    hide-on-click-modal
    preview-teleported
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  thumbnail?: string
}>()
</script>
