<template>
  <div class="h-full flex flex-col">
    <ChatHeader :online="appStore.currentChatIsOnline" />
    <ChatMain>
      <div
        ref="scrollerRef"
        class="relative h-full w-full flex-1 flex-1 overflow-y-auto bg-gray-2 p-10px"
      >
        <ChatMessage
          v-for="item in appStore.currentChatMessages"
          :key="item.mid"
          :msg="item"
          @contextmenu="handleContextMenu"
        />
      </div>
      <ElButton
        v-show="!isNearBottom"
        title="滚动到底部"
        circle
        class="absolute bottom-20 left-1/2 z-10 -translate-x-1/2"
        @click="scrollToBottom"
      >
        <IconArrowDown />
      </ElButton>
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
import type { TextFieldExposed } from '@/components/TextField.vue'

const route = useRoute('chat-id')
const router = useRouter()
const appStore = useAppStore()

const scrollerRef = ref<HTMLDivElement | null>(null)
const textFieldRef = ref<TextFieldExposed | null>(null)

const { scrollToBottom, isNearBottom } = useScrollBottom(scrollerRef)

const { message, sendMessage, handleContextMenu } = useChatMessage({
  onNewMessage: scrollToBottom,
  onBeforeSendMessage() {
    if (appStore.currentChatIsOnline) return true
    ElMessage.error('当前用户不在线，无法发送消息')
    return false
  },
  onSendMessage() {
    scrollToBottom()
  }
})

function onBeforeUpload() {
  if (!appStore.currentChatIsOnline) {
    ElMessage.error('当前用户不在线，无法发送文件')
    return false
  }
}

const { percentage, remainPercent, onUploadProgress, onUploadSuccess } = useFileUploader({
  onSuccess: scrollToBottom
})

onMounted(() => {
  const uid = route.params.id as string
  if (!uid || !appStore.validateUid(uid)) {
    appStore.clearCurrentChatUser()
    router.push('/')
    return
  }
  appStore.setCurrentChatUser(uid)

  nextTick(() => {
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
