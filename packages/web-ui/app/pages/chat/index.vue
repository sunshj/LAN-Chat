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
        :class="['absolute inset-0 z-10 h-1 w-full', uploadPercentage > 0 && 'bg-green-500']"
        :style="{ translate: `-${remainUploadPercent}` }"
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
import { useZIndex, type UploadFile, type UploadProgressEvent } from 'element-plus'
import type { TextFieldExposed } from '@/components/TextField.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const fileStore = useFileStore()

const { $contextmenu, $worker, $socket } = useNuxtApp()

const message = ref('')

const containerRef = ref<HTMLDivElement | null>(null)
const textFieldRef = ref<TextFieldExposed | null>(null)

const scrollToBottom = useDebounceFn(() => {
  if (!containerRef.value) return
  const { scrollHeight, clientHeight, scrollTop } = containerRef.value
  if (scrollHeight - clientHeight - scrollTop > 20) {
    containerRef.value.scrollTo(0, scrollHeight - clientHeight)
    containerRef.value.addEventListener('scrollend', () => {
      appStore.setInitialScrolled(true)
    })
  } else {
    appStore.setInitialScrolled(true)
  }
}, 1000)

const currentSelectMid = ref('')
const currentSelectMessage = computed(() => appStore.getMessage(currentSelectMid.value))

const { nextZIndex } = useZIndex()
const { text: selectedText } = useTextSelection()

function handleContextMenu(e: MouseEvent, mid: string) {
  currentSelectMid.value = mid
  $contextmenu.showContextMenu({
    x: e.x,
    y: e.y,
    zIndex: nextZIndex(),
    items: [
      {
        label: '复制',
        hidden: currentSelectMessage.value?.type !== 'text' && !selectedText.value,
        async onClick() {
          const text = selectedText.value || currentSelectMessage.value?.content
          await copyText(text)
          window.getSelection()?.removeAllRanges()
        }
      },
      {
        label: '下载',
        hidden: !['image', 'audio', 'video'].includes(currentSelectMessage.value!.type),
        onClick() {
          downloadMsgFile(currentSelectMessage.value!)
        }
      },
      {
        label: '删除',
        onClick() {
          confirmDeleteMessage()
        }
      }
    ]
  })
}

const { copy, copied } = useClipboard({
  legacy: true
})

async function copyText(content?: string) {
  if (!content) return
  await copy(content)
  if (copied.value) {
    ElMessage.success('Copied')
  } else {
    ElMessage.error('Copy failed')
  }
}

function confirmDeleteMessage() {
  ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '算了'
  }).then(() => {
    nextTick(() => {
      appStore.deleteMessage(currentSelectMid.value)
    })
  })
}

const sendMessage = useThrottleFn(() => {
  if (!message.value.trim()) return
  if (!appStore.currentChatIsOnline) return ElMessage.error('当前用户不在线，无法发送消息')
  const msg = appStore.addMessage(message.value)
  $socket.emit('$new-message', msg)

  message.value = ''

  nextTick(() => {
    scrollToBottom()
  })
}, 2000)

function onBeforeUpload() {
  if (!appStore.currentChatIsOnline) {
    ElMessage.error('当前用户不在线，无法发送文件')
    return false
  }
}

const uploadPercentage = ref(0)
const remainUploadPercent = computed(() => `${100 - uploadPercentage.value}%`)

function onUploadProgress(evt: UploadProgressEvent) {
  uploadPercentage.value = Number.parseFloat(evt.percent.toFixed(2))
  if (evt.percent === 100) {
    uploadPercentage.value = 0
  }
}

async function onUploadSuccess(res: UploadFileResult, file: UploadFile) {
  const { newFilename, mimetype } = res.data
  const type = getMessageType(mimetype!)

  const payload: MessagePayload = {}
  payload.video = type === 'video' ? await getVideoCover(newFilename) : undefined
  payload.audio = type === 'audio' ? await getAudioFileInfo(file.raw!) : undefined
  payload.image = type === 'image' ? await getImageThumbnail(file.raw!) : undefined

  const msg = appStore.addMessage(newFilename, { type, payload })
  fileStore.fileStatus.push({ file: msg.content, download: true })
  $socket.emit('$new-message', msg)

  nextTick(() => {
    scrollToBottom()
  })
}

function handleNewMessage() {
  nextTick(() => {
    scrollToBottom()
  })
}

$socket.on('$new-message', handleNewMessage)

onBeforeMount(() => {
  appStore.setInitialScrolled(false)
})

onMounted(() => {
  const uid = route.query.uid as string
  if (!uid || !appStore.validateUid(uid)) {
    appStore.clearCurrentChatUser()
    router.push('/')
    return
  }
  appStore.setCurrentChatUser(uid)

  if (appStore.currentChatMessages.length > 0) {
    appStore.setMessagesAsRead()

    const fileMessages = appStore.currentChatMessages?.filter(m => m.type !== 'text')
    if (fileMessages.length > 0) {
      $worker.emit(
        'check-file',
        fileMessages.map(v => v.content)
      )
    }

    nextTick(() => {
      scrollToBottom()
      textFieldRef.value?.focus()
    })
  }
})

onBeforeUnmount(() => {
  message.value = ''
  appStore.setInitialScrolled(false)
  appStore.clearCurrentChatUser()
  fileStore.setFileStatus([])
  fileStore.setMarkdown([])
  $socket.off('$new-message', handleNewMessage)
})
</script>

<style>
.chat-drawer .el-drawer__body {
  overflow: hidden;
  padding: 0;
}
</style>
