<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const appStore = useAppStore()

const { $socket } = useNuxtApp()

onMounted(() => {
  appStore.cleanUselessChat()

  $socket.on('connect', async () => {
    const storageUid = appStore.userInfo.id || 'invalid_uid'
    const userExist = await appStore.fetchUser(storageUid)
    if (userExist) {
      $socket.emit('$user-online', appStore.userInfo.id)
    } else {
      const user = await appStore.createUser(getDeviceName(navigator.userAgent!))
      appStore.setUserInfo(user)
      $socket.emit('$user-online', user.id)
    }
  })

  $socket.on('$new-message', msg => {
    if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
    appStore.messages[msg.cid].push(msg)
  })

  $socket.on('$get-users', async usersId => {
    const remainIds = usersId.filter(id => id !== appStore.userInfo.id)
    const allUsers = await appStore.fetchUsers()
    appStore.setUsers(allUsers)
    const onlineUsers = allUsers.filter(user => remainIds.includes(user.id))
    appStore.setOnlineUsers(onlineUsers)
    // currentChatUser rename
    const currentChatUser = onlineUsers.find(user => user.id === appStore.currentChatUser.id)
    if (currentChatUser) {
      appStore.setCurrentChatUser(currentChatUser)
    }
  })

  $socket.on('disconnect', () => {
    appStore.setOnlineUsers([])
  })
})

onBeforeUnmount(() => {
  $socket.off('$new-message')
  $socket.off('$get-users')
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
</style>
