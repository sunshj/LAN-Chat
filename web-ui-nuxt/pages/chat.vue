<template>
  <div class="text-red-700 font-bold">Chat page</div>

  <div>support touch: <el-checkbox v-model="appStore.isSupportTouch" size="large" disabled /></div>
</template>

<script setup lang="ts">
const appStore = useAppStore()
</script>
