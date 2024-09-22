<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const fileStore = useFileStore()
const { $ws } = useNuxtApp()

watch($ws.status, async newStatus => {
  if (newStatus === 'OPEN') {
    const storageUid = appStore.userInfo.id || 'invalid_uid'
    const userExist = await appStore.fetchUser(storageUid)

    if (userExist) {
      $ws.send(createWsMessage('$user-online', appStore.userInfo.id))
    } else {
      const user = await appStore.createUser(getDeviceName(navigator.userAgent!))
      appStore.setUserInfo(user)
      $ws.send(createWsMessage('$user-online', user.id))
    }
  }

  if (newStatus === 'CLOSED') {
    appStore.setOnlineUsers([])
  }
})

watch($ws.data, async newData => {
  const { type, payload } = parseWsMessage(newData)
  if (type === '$new-message') {
    const msg = payload
    if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
    appStore.messages[msg.cid].push(msg)

    // set message read
    if (msg.receiver === appStore.userInfo.id && msg.sender === appStore.currentChatUser.id) {
      msg.read = true
    }

    // set file downloaded
    if (msg.type !== 'text') {
      fileStore.fileStatus.push({ file: msg.content, download: true })
    }
  }

  if (type === '$get-users') {
    const usersId = payload
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
  }
})

onBeforeMount(() => {
  appStore.cleanUselessChat()
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
