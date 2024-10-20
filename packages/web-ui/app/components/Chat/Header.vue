<template>
  <header class="flex-0-0-auto p-6">
    <div class="flex items-center gap-2">
      <NuxtLink href="/">
        <IconArrowLeft class="mr-2 cursor-pointer" />
      </NuxtLink>
      <ElBadge
        is-dot
        :type="props.online ? 'success' : 'danger'"
        :offset="[-5, 5]"
        :badge-style="{ width: '10px', height: '10px' }"
        class="h-30px w-30px"
      >
        <Avatar :id="appStore.currentChatUser.id" :size="30" />
      </ElBadge>
      <div>{{ appStore.currentChatUser.username }}</div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  online: boolean
}>()

const appStore = useAppStore()
</script>
