<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const fileStore = useFileStore()
const { $socket } = useNuxtApp()

onBeforeMount(() => {
  appStore.cleanUselessChat()
})

async function onConnect() {
  const storageUid = appStore.userInfo.id || 'invalid_uid'
  console.log('storageUid: ', storageUid)
  const userExist = await appStore.fetchUser(storageUid)

  if (userExist) {
    $socket.emit('$user-online', appStore.userInfo.id)
  } else {
    const user = await appStore.createUser(getDeviceName(navigator.userAgent!))
    appStore.setUserInfo(user)
    $socket.emit('$user-online', user.id)
  }
}

function onDisconnect() {
  appStore.setOnlineUsers([])
}

function handleNewMessage(msg: Message) {
  if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
  appStore.messages[msg.cid]!.push(msg)

  // set message read
  if (msg.receiver === appStore.userInfo.id && msg.sender === appStore.currentChatUser.id) {
    msg.read = true
  }

  // set file downloaded
  if (msg.type !== 'text') {
    fileStore.fileStatus.push({ file: msg.content, download: true })
  }
}

async function handleGetUsers(usersId: string[]) {
  const remainIds = usersId.filter(id => id !== appStore.userInfo.id)
  const allUsers = await appStore.fetchUsers()
  appStore.setUsers(allUsers)
  const onlineUsers = allUsers.filter(user => remainIds.includes(user.id))
  appStore.setOnlineUsers(onlineUsers)

  const currentChatUser = onlineUsers.find(user => user.id === appStore.currentChatUser.id)
  if (currentChatUser) {
    appStore.setCurrentChatUser(currentChatUser)
  }
}

$socket.on('connect', onConnect)
$socket.on('$new-message', handleNewMessage)
$socket.on('$get-users', handleGetUsers)
$socket.on('disconnect', onDisconnect)

onBeforeUnmount(() => {
  $socket.off('connect', onConnect)
  $socket.off('disconnect', onDisconnect)
  $socket.off('$new-message', handleNewMessage)
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
</style>
