<template>
  <header class="flex-0-0-auto p-6">
    <div class="flex items-center gap-2">
      <NuxtLink href="/">
        <IconArrowLeft class="mr-2 cursor-pointer" />
      </NuxtLink>
      <ElBadge
        v-if="!isGroupChat"
        is-dot
        :type="props.online ? 'success' : 'danger'"
        :offset="[-5, 5]"
        :badge-style="{ width: '10px', height: '10px' }"
        class="h-30px w-30px"
      >
        <Avatar :id="appStore.currentChatUser.id" :size="30" />
      </ElBadge>

      <div>{{ appStore.currentChatUser.username }}</div>
      <div v-if="isGroupChat">( {{ appStore.onlineUsers.length + 1 }} 人在线 )</div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  online: boolean
}>()

const appStore = useAppStore()

const isGroupChat = computed(() => appStore.currentChatUser.id === GROUP_CHAT_ID)
</script>
