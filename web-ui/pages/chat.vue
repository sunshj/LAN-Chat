<template>
  <div class="h-full flex flex-col">
    <ChatHeader :online="currentChatIsOnline" />
    <main class="h-full w-full flex flex-1 flex-col items-center gap-2 overflow-y-auto">
      <div ref="containerRef" class="relative w-full flex-1 overflow-y-auto bg-gray-2">
        <div class="h-full flex-1 p-10px">
          <div
            v-for="{ time, content, sender, type, mid, payload } in appStore.currentChatMessages"
            :key="time"
            :class="sender === appStore.userInfo.id ? 'flex justify-end' : 'flex'"
          >
            <div
              :class="['message', sender === appStore.userInfo.id ? 'sender' : 'receiver']"
              @contextmenu.prevent="handleContextMenu($event, mid)"
              @click.stop
            >
              <div v-if="type === 'text'">
                <Markdown
                  v-if="isMarkdownValue(content)"
                  :value="content"
                  :is-sender="sender === appStore.userInfo.id"
                  @loaded="scrollToBottom"
                />

                <div v-else>{{ content }}</div>
              </div>

              <Image
                v-else-if="type === 'image'"
                :url="formatFileUrl(content)"
                :thumbnail="formatFileUrl(payload?.image?.thumbnail || content)"
              />

              <div v-else>
                <Video
                  v-if="type === 'video'"
                  :cover="formatFileUrl(payload?.video?.cover)"
                  :url="formatFileUrl(content)"
                />

                <Audio
                  v-else-if="type === 'audio'"
                  :url="formatFileUrl(content)"
                  :audio="payload?.audio"
                />

                <File
                  v-else
                  :url="formatFileUrl(content)"
                  :support-download="fileSupportDownload(content)"
                />
              </div>
              <p class="relative block w-full text-end text-xs text-[#777]">
                {{ formatTimeAgo(new Date(time)) }}
              </p>
            </div>
          </div>
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

      <el-upload
        :show-file-list="false"
        action="/api/upload"
        :before-upload="onBeforeUpload"
        :on-progress="onUploadProgress"
        :on-success="onUploadSuccess"
      >
        <el-button plain size="large">
          <IconUpload class="text-xl" />
        </el-button>
      </el-upload>
      <div class="flex-1">
        <TextField
          ref="textFieldRef"
          v-model="message"
          :on-upload-progress="onUploadProgress"
          :on-upload-success="onUploadSuccess"
          @enter="send()"
        />
      </div>
      <ElButton type="primary" size="large" :disabled="!message" @click="send()">Send</ElButton>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { type UploadFile, type UploadProgressEvent, useZIndex } from 'element-plus'
import MyWorker from '@/assets/worker.js?worker'
import type { TextFieldExposed } from '@/components/TextField.vue'

const worker = new MyWorker()

const appStore = useAppStore()
const { $contextmenu, $socket } = useNuxtApp()
const route = useRoute()

const message = ref('')

const containerRef = ref<HTMLDivElement | null>(null)
const textFieldRef = ref<TextFieldExposed | null>(null)

const fileStatus = ref<FileStatus[]>([])

const fileSupportDownload = (file: string) =>
  fileStatus.value.find(f => f.file === file)?.download ?? false

const scrollToBottom = useDebounceFn(() => {
  if (!containerRef.value) return
  const { scrollHeight, clientHeight, scrollTop } = containerRef.value
  if (scrollHeight - clientHeight - scrollTop > 20) {
    containerRef.value?.scrollTo(0, scrollHeight - clientHeight)
  }
})

const currentSelectMid = ref('')
const currentSelectMessage = computed(() => appStore.getMessage(currentSelectMid.value))

const { nextZIndex } = useZIndex()
function handleContextMenu(e: MouseEvent, mid: string) {
  currentSelectMid.value = mid
  $contextmenu.showContextMenu({
    x: e.x,
    y: e.y,
    zIndex: nextZIndex(),
    items: [
      {
        label: '复制',
        hidden: currentSelectMessage.value?.type !== 'text',
        async onClick() {
          const text = window.getSelection()?.toString() || currentSelectMessage.value?.content
          await copyText(text)
          window.getSelection()?.removeAllRanges()
        }
      },
      {
        label: '下载',
        hidden: !['image', 'audio', 'video'].includes(currentSelectMessage.value!.type),
        onClick() {
          download(currentSelectMessage.value!)
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

  if (isMarkdownValue(content)) {
    const text = await getMarkdownPlainText(content)
    await copy(text)
  } else {
    await copy(content)
  }
  if (copied.value) {
    ElMessage.success('Copied')
  } else {
    ElMessage.error('Copy failed')
  }
}

function download(msg: Message) {
  const url = formatFileUrl(msg.content)
  const filename = getOriginalFilename(msg.content)
  downloadFile(url, filename)
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

const currentChatIsOnline = computed(() => {
  return appStore.onlineUsers.map(u => u.id).includes(appStore.currentChatUser.id)
})

const send = useThrottleFn(() => {
  if (!message.value.trim()) return
  if (!currentChatIsOnline.value) return ElMessage.error('当前用户不在线，无法发送消息')
  const msg = appStore.addMessage(message.value)
  $socket.emit('new-message', msg)
  message.value = ''

  nextTick(() => {
    scrollToBottom()
  })
}, 2000)

function onBeforeUpload() {
  if (!currentChatIsOnline.value) {
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
  const { filename, mimetype } = res.data
  const type = getMessageType(mimetype)

  const payload: MessagePayload = {}
  payload.video = type === 'video' ? await getVideoCover(filename) : undefined
  payload.audio = type === 'audio' ? await getAudioFileInfo(file.raw!) : undefined
  payload.image = type === 'image' ? await getImageThumbnail(file.raw!) : undefined

  const msg = appStore.addMessage(filename, { type, payload })
  fileStatus.value.push({ file: msg.content, download: true })
  $socket.emit('new-message', msg)
  nextTick(() => {
    scrollToBottom()
  })
}

const handleNewMessage = (msg: Message) => {
  if (msg.receiver === appStore.userInfo.id && msg.sender === appStore.currentChatUser.id) {
    msg.read = true
  }

  if (msg.type !== 'text') {
    fileStatus.value.push({ file: msg.content, download: true })
  }

  nextTick(() => {
    scrollToBottom()
  })
}

onMounted(() => {
  const uid = route.query.uid as string
  if (uid) appStore.setCurrentChatUser(uid)

  if (appStore.currentChatMessages.length > 0) {
    appStore.setMessagesAsRead()

    const fileMessages = appStore.currentChatMessages?.filter(m => m.type !== 'text')
    if (fileMessages.length > 0) {
      worker.postMessage({
        type: 'check-file',
        payload: fileMessages.map(v => v.content)
      })
    }

    nextTick(() => {
      scrollToBottom()
      nextTick(() => {
        textFieldRef.value?.focus()
      })
    })
  }

  $socket.on('new-message', handleNewMessage)

  worker.addEventListener('message', event => {
    const { type, payload } = event.data
    if (type === 'check-file-reply') {
      fileStatus.value = payload
    }
  })
})

onBeforeUnmount(() => {
  message.value = ''
  appStore.clearCurrentChatUser()
  $socket.off('new-message', handleNewMessage)
  worker.terminate()
})
</script>

<style scoped>
.message {
  position: relative;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
  word-break: break-all;
  box-shadow: 0 0 1px #f2f3f4;
  max-width: 100%;
}

.message::before {
  position: absolute;
  top: 0;
  content: '';
  border: 10px solid transparent;
  border-top: 10px solid #fff;
}

.message.sender {
  border-top-right-radius: 0;
}

.message.sender::before {
  right: -10px;
}

.message.receiver {
  border-top-left-radius: 0;
}

.message.receiver::before {
  left: -10px;
}
</style>

<style>
.chat-drawer .el-drawer__body {
  overflow: hidden;
  padding: 0;
}
</style>
