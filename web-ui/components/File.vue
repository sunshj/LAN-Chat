<template>
  <div class="flex flex-col gap-2">
    <div>{{ getOriginalFilename(props.url) }}</div>
    <a :href="props.url" :download="getOriginalFilename(props.url)">
      <el-button class="w-full" type="success" :disabled="!props.supportDownload">
        <IconDownload />
      </el-button>
    </a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  supportDownload: boolean
}>()
</script>
