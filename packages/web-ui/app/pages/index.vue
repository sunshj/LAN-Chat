<template>
  <ElContainer class="h-full" direction="vertical">
    <AppHeader @show-profile="showProfile" />

    <main class="flex flex-wrap gap-2 p-2">
      <!-- group chat -->
      <div
        class="relative min-h-30 w-36 flex-center flex-col cursor-pointer gap-2 border border-1px border-amber rounded-xl border-solid p-2 text-sm font-bold uppercase transition hover:scale-105 hover:bg-gray-1"
        @click="gotoGroupChat"
      >
        <ElBadge> Group Chat </ElBadge>
      </div>

      <!-- private chat -->
      <div
        v-for="user in appStore.hasChatHistoryOrOnlineUsers"
        :key="user.id"
        class="group relative w-36 flex-center flex-col cursor-pointer gap-2 border border-1px border-gray-1 rounded-xl border-solid p-2 text-sm font-bold uppercase transition hover:scale-105 hover:bg-gray-1"
        @click="gotoChat(user)"
      >
        <div
          class="absolute right-0 top-0 scale-125 px-2 opacity-0 transition hover:text-blue-500 group-hover:opacity-100"
          @click.stop="confirmDeleteChat(user.id)"
        >
          ×
        </div>
        <ElBadge v-bind="badgeProps(user.id)" :offset="[-10, 10]">
          <Avatar :id="user.id" />
        </ElBadge>
        <div>{{ user.username }}</div>
      </div>
    </main>
  </ElContainer>

  <Profile v-model="profileDrawerVisible" />
</template>

<script setup lang="ts">
import type { BadgeProps } from 'element-plus'

const appStore = useAppStore()

const profileDrawerVisible = ref(false)

function gotoChat(user: User) {
  appStore.setCurrentChatUser(user)
  navigateTo(`/chat?uid=${user.id}`)
}

function gotoGroupChat() {
  navigateTo('/chat/group')
}

function showProfile() {
  profileDrawerVisible.value = true
}

function isOnlineUser(userId: string) {
  return appStore.onlineUsers.some(user => user.id === userId)
}

function getUnreadCount(userId: string) {
  const chatId = appStore.generateChatId(userId)
  return appStore.unreadMessagesCount[chatId] || 0
}

function badgeProps(userId: string): Partial<BadgeProps> {
  if (isOnlineUser(userId)) {
    return {
      type: 'success',
      isDot: false,
      showZero: false,
      value: getUnreadCount(userId)
    }
  }
  return {
    type: 'danger',
    isDot: true,
    showZero: true,
    value: 0,
    badgeStyle: {
      width: '14px',
      height: '14px'
    }
  }
}

function confirmDeleteChat(userId: string) {
  ElMessageBox.confirm('确定要删除此聊天记录吗？', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '算了',
    type: 'warning'
  }).then(() => {
    appStore.deleteChatByUserId(userId)
  })
}
</script>
