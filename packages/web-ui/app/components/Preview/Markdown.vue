<template>
  <MDC class="markdown max-w-80vw lh-loose" :value="props.value" />
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string
}>()
</script>
