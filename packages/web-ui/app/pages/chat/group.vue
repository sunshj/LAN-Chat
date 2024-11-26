<template>
  <div class="h-full flex flex-col">
    <ChatHeader group :online="appStore.currentChatIsOnline" />
    <ChatMain>
      <div ref="scrollerRef" class="h-full w-full flex-1 flex-1 overflow-y-auto bg-gray-2 p-10px">
        <ChatMessage
          v-for="item in appStore.currentChatMessages"
          :key="item.mid"
          :msg="item"
          @contextmenu="handleContextMenu"
        />
      </div>
    </ChatMain>

    <ChatFooter>
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
    </ChatFooter>
  </div>
</template>

<script setup lang="ts">
import type { TextFieldExposed } from '~/components/TextField.vue'

const appStore = useAppStore()

const scrollerRef = ref<HTMLDivElement | null>(null)
const textFieldRef = ref<TextFieldExposed | null>(null)

const { scrollToBottom } = useScrollBottom(scrollerRef)

const { message, sendMessage, handleContextMenu } = useChatMessage({
  isGroupChat: true,
  onNewMessage: scrollToBottom,
  onBeforeSendMessage() {
    if (appStore.onlineUsers.length !== 0) return true
    ElMessage.error('当前群聊无在线用户，无法发送消息')
    return false
  },
  async onSendMessage(msg) {
    await appStore.createGroupMessage(msg)
    scrollToBottom()
  }
})

const { percentage, remainPercent, onUploadProgress, onUploadSuccess } = useFileUploader({
  isGroupChat: true,
  async onSuccess(msg) {
    await appStore.createGroupMessage(msg)
    scrollToBottom()
  }
})

function onBeforeUpload() {
  if (appStore.onlineUsers.length === 0) {
    ElMessage.error('当前群聊无在线用户，无法发送消息')
    return false
  }
}

onBeforeMount(() => {
  appStore.clearGroupMessages()
  appStore.syncGroupMessages()
})

onMounted(() => {
  appStore.setCurrentChatUser({
    id: GROUP_CHAT_ID,
    username: 'Group Chat'
  })

  nextTick(() => {
    textFieldRef.value?.focus()
  })
})

onBeforeUnmount(() => {
  appStore.clearCurrentChatUser()
})
</script>
