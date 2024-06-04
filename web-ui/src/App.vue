<template>
  <ElContainer class="h-full">
    <ElHeader class="h-15 flex items-center justify-between bg-gray-100 px-4">
      <div>LAN Chat</div>

      <Avatar :id="appStore.userInfo.id" :size="40" @click="profileDrawerVisible = true" />
    </ElHeader>

    <main class="flex gap-2 p-2">
      <div
        v-for="user in appStore.users"
        :key="user.id"
        class="w-36 flex-center flex-col cursor-pointer gap-2 border border-1px rounded-xl p-2 text-sm font-bold uppercase transition hover:scale-105 hover:bg-gray-1"
        @click="showChatDrawer(user)"
      >
        <ElBadge :show-zero="false" :value="getUnreadCount(user.id)" :offset="[-10, 10]">
          <Avatar :id="user.id" />
        </ElBadge>
        <div>{{ user.username }}</div>
      </div>
    </main>
  </ElContainer>

  <Chat v-model="chatDrawerVisible" />
  <Profile v-model="profileDrawerVisible" />
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'
import { useAppStore } from './stores'
import { getDeviceName, socketKey } from './utils'
import type { User } from '@prisma/client'

const socket = io('/', {
  transports: ['websocket']
})

provide(socketKey, socket)

const appStore = useAppStore()

const chatDrawerVisible = ref(false)
const profileDrawerVisible = ref(false)

function showChatDrawer(user: User) {
  chatDrawerVisible.value = true
  appStore.setCurrentChat(user)
}

function getUnreadCount(userId: string) {
  const channelId = appStore.generateChannelId(userId)
  return appStore.unreadMessagesCount[channelId] || 0
}

onMounted(async () => {
  const storageUid = appStore.userInfo.id || 'invalid_uid'
  const userExist = await appStore.fetchUser(storageUid)

  if (userExist) {
    socket.emit('online', appStore.userInfo.id)
  } else {
    const user = await appStore.createUser(getDeviceName(navigator.userAgent!))
    appStore.setUserInfo(user)
    socket.emit('online', user.id)
  }

  socket.on('get-users', async (userIds: string[]) => {
    const remainIds = userIds.filter(id => id !== appStore.userInfo.id)
    const allUsers = await appStore.fetchUsers()
    const onlineUsers = allUsers.filter(user => remainIds.includes(user.id))
    appStore.setUsers(onlineUsers)
    // currentChat rename
    const currentChatUser = onlineUsers.find(user => user.id === appStore.currentChat.id)
    if (currentChatUser) {
      appStore.setCurrentChat(currentChatUser)
    }
  })
})

onBeforeUnmount(() => {
  socket.disconnect()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
