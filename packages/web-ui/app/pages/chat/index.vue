<template>
  <div class="h-full flex flex-col">
    <ChatHeader :online="appStore.currentChatIsOnline" />
    <main
      id="mainContainer"
      class="h-full w-full flex flex-1 flex-col items-center gap-2 overflow-y-auto"
    >
      <div ref="containerRef" class="relative w-full flex-1 overflow-y-auto bg-gray-2">
        <div class="h-full flex-1 p-10px">
          <ChatMessage
            v-for="msg in appStore.currentChatMessages"
            :key="msg.time"
            :msg
            @loaded="scrollToBottom"
            @contextmenu="handleContextMenu"
          />
        </div>
      </div>
    </main>

    <footer
      class="relative min-h-14 w-full flex flex-0-0-auto items-start justify-around gap-2 bg-white p-2"
    >
      <div
        :class="['absolute inset-0 z-10 h-1 w-full', percentage > 0 && 'bg-green-500']"
        :style="{ translate: `-${remainPercent}` }"
      />

      <ElUpload
        :show-file-list="false"
        action="/api/upload"
        :before-upload="onBeforeUpload"
        :on-progress="onUploadProgress"
        :on-success="onUploadSuccess"
      >
        <ElButton plain size="large">
          <IconUpload class="text-xl" />
        </ElButton>
      </ElUpload>
      <div class="flex-1">
        <TextField
          ref="textFieldRef"
          v-model="message"
          :on-upload-progress="onUploadProgress"
          :on-upload-success="onUploadSuccess"
          @enter="sendMessage()"
        />
      </div>
      <ElButton type="primary" size="large" :disabled="!message" @click="sendMessage()">
        Send
      </ElButton>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { TextFieldExposed } from '@/components/TextField.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const containerRef = ref<HTMLDivElement | null>(null)
const textFieldRef = ref<TextFieldExposed | null>(null)

const { scrollToBottom } = useScrollToBottom(containerRef)

const { message, sendMessage, handleContextMenu, checkFileStatus } = useChatMessage({
  onNewMessage: () => nextTick(scrollToBottom),
  onBeforeSendMessage() {
    if (appStore.currentChatIsOnline) return true
    ElMessage.error('当前用户不在线，无法发送消息')
    return false
  },
  onSendMessage() {
    nextTick(scrollToBottom)
  }
})

function onBeforeUpload() {
  if (!appStore.currentChatIsOnline) {
    ElMessage.error('当前用户不在线，无法发送文件')
    return false
  }
}

const { percentage, remainPercent, onUploadProgress, onUploadSuccess } = useFileUploader({
  onSuccess: () => nextTick(scrollToBottom)
})

onMounted(() => {
  const uid = route.query.uid as string
  if (!uid || !appStore.validateUid(uid)) {
    appStore.clearCurrentChatUser()
    router.push('/')
    return
  }
  appStore.setCurrentChatUser(uid)

  checkFileStatus()

  nextTick(() => {
    scrollToBottom()
    textFieldRef.value?.focus()
  })
})

onBeforeUnmount(() => {
  appStore.clearCurrentChatUser()
})
</script>

<style>
.chat-drawer .el-drawer__body {
  overflow: hidden;
  padding: 0;
}
</style>
