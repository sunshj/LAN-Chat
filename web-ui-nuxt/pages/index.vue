<template>
  <div class="flex-center flex-col gap-2">
    <div class="text-2xl font-bold">index page</div>
    <el-button type="primary" @click="$router.push('/chat')">go to chat</el-button>

    {{ users }}
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

const users = await appStore.fetchUsers()
</script>
