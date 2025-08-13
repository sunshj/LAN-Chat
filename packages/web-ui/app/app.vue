<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const { $socket } = useNuxtApp()
const router = useRouter()

const bus = useEventBus('mdc:copied')

bus.on(() => {
  ElMessage.success('Copied!')
})

onBeforeMount(() => {
  appStore.cleanUselessChat()

  $socket.on('$new-message', handleNewMessage)
  $socket.on('$new-group-message', handleNewMessage)
  $socket.on('$get-users', handleGetUsers)
})

function handleNewMessage(msg: Message) {
  if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
  appStore.messages[msg.cid]!.push(msg)

  // set message read
  if (msg.receiver === appStore.userInfo.id && msg.sender === appStore.currentChatUser.id) {
    msg.read = true
  }

  // notification
  if (
    msg.cid !== GROUP_CHAT_ID &&
    msg.receiver === appStore.userInfo.id &&
    msg.sender !== appStore.currentChatUser.id
  ) {
    const senderName = appStore.users.find(user => user.id === msg.sender)?.username ?? msg.sender
    const notification = ElNotification.success({
      title: 'You have a new message',
      message: `From ${senderName} (click to chat)`,
      customClass: 'cursor-pointer',
      position: 'top-right',
      duration: 3000,
      onClick() {
        router.push(`/chat/${msg.sender}`)
        notification.close()
      }
    })
  }
}

async function handleGetUsers(usersId: string[]) {
  const allUsers = await appStore.fetchUsers()
  appStore.setUsers(allUsers)
  const onlineUsers = allUsers.filter(user => usersId.includes(user.id))
  appStore.setRawOnlineUsers(onlineUsers)

  const currentChatUser = onlineUsers.find(user => user.id === appStore.currentChatUser.id)
  if (currentChatUser) {
    appStore.setCurrentChatUser(currentChatUser)
  }
}

onBeforeUnmount(() => {
  $socket.off('$new-message', handleNewMessage)
  $socket.off('$new-group-message', handleNewMessage)
  $socket.off('$get-users', handleGetUsers)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  scroll-behavior: smooth;
}

html,
body,
#__nuxt {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.prose-p {
  margin: 0 !important;
}
</style>
