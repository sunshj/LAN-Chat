<template>
  <el-image
    fit="cover"
    :src="props.thumbnail"
    class="aspect-ratio h-40 cursor-pointer"
    loading="lazy"
    :preview-src-list="[props.url]"
    hide-on-click-modal
    preview-teleported
  >
    <template #error>
      <div
        class="aspect-ratio-square h-full flex cursor-auto items-center justify-center bg-gray-1 text-gray-400"
      >
        加载失败
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  thumbnail?: string
}>()
</script>
