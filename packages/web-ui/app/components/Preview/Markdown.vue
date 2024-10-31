<template>
  <MDC class="markdown lh-loose" :value="props.value" />
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string
}>()
</script>
