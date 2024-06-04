<template>
  <ElDrawer v-model="visible" class="chat-drawer" direction="btt" size="100%" @closed="onClose">
    <div class="h-full w-full flex flex-col items-center gap-2">
      <div class="flex flex-col items-center gap-2">
        <ElBadge
          is-dot
          :type="currentChatIsOnline ? 'success' : 'danger'"
          :offset="[-10, 10]"
          :badge-style="{ width: '14px', height: '14px' }"
        >
          <Avatar :id="appStore.currentChat.id" />
        </ElBadge>
        <div>{{ appStore.currentChat.username }}</div>
      </div>

      <div ref="messageRef" class="relative mb-14 w-full flex-1 overflow-y-auto bg-gray-2">
        <div class="h-full flex-1 p-10px">
          <div
            v-for="{ time, content, sender, type } in appStore.currentChatMessages"
            :key="time"
            :class="sender === appStore.userInfo.id ? 'flex justify-end' : 'flex'"
          >
            <div :class="['message', sender === appStore.userInfo.id ? 'sender' : 'receiver']">
              <div v-if="type === 'text'">{{ content }}</div>
              <div v-else-if="type === 'image'">
                <el-image
                  fit="cover"
                  :src="formatFileUrl(content)"
                  class="h-40 w-40"
                  :preview-src-list="[formatFileUrl(content)]"
                />
              </div>

              <div v-else class="flex flex-col gap-2">
                <div>{{ getOriginalFilename(content) }}</div>

                <video
                  v-if="type === 'video'"
                  :src="formatFileUrl(content)"
                  controls
                  :autoplay="false"
                  class="h-40"
                />

                <audio
                  v-else-if="type === 'audio'"
                  :src="formatFileUrl(content)"
                  controls
                  :autoplay="false"
                  class="h-10"
                />

                <a v-else :href="formatFileUrl(content)" :download="getOriginalFilename(content)">
                  <el-button
                    class="w-full"
                    type="success"
                    :disabled="!fileSupportDownload(content)"
                  >
                    <DownloadIcon />
                  </el-button>
                </a>
              </div>
              <p class="relative block w-full text-end text-xs text-[#777]">
                {{ formatTimeAgo(new Date(time)) }}
              </p>
            </div>
          </div>
        </div>
        <div class="fixed bottom-0 h-14 w-full flex items-start justify-around gap-2 bg-white p-2">
          <el-upload :show-file-list="false" action="/api/upload" :on-success="onUploadSuccess">
            <el-button plain size="large">
              <UploadBoxIcon class="text-xl" />
            </el-button>
          </el-upload>
          <div class="flex-1">
            <ElInput
              v-model.trim="message"
              size="large"
              placeholder="Ctrl + Enter to send"
              @keydown.ctrl.enter="send()"
            />
          </div>
          <ElButton type="primary" size="large" :disabled="!message" @click="send()">Send</ElButton>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { type Message, type MessageType, useAppStore } from '../stores'
import { getOriginalFilename, socketKey } from '../utils'

const appStore = useAppStore()
const socket = inject(socketKey)!

const visible = defineModel<boolean>({
  default: false,
  required: true
})

const message = ref('')

const messageRef = ref<HTMLDivElement>()

interface FileStatus {
  file: string
  download: boolean
}

const fileStatus = ref<FileStatus[]>([])

const fileSupportDownload = (file: string) => fileStatus.value.find(f => f.file === file)?.download

const formatFileUrl = (filename: string) => `/api/download/${filename}`

function scrollToBottom() {
  const { scrollHeight, clientHeight } = messageRef.value!
  messageRef.value?.scroll(0, scrollHeight - clientHeight)
}

function send() {
  if (!message.value) return
  const msg = appStore.addMessage(message.value)
  socket.emit('new-message', msg)
  message.value = ''

  nextTick(() => {
    scrollToBottom()
  })
}

const currentChatIsOnline = computed(() => {
  return appStore.users.map(u => u.id).includes(appStore.currentChat.id)
})

function getMessageType(mimetype: string): MessageType {
  if (mimetype.includes('image')) return 'image'
  if (mimetype.includes('video')) return 'video'
  if (mimetype.includes('audio')) return 'audio'
  return 'file'
}

function onUploadSuccess(data: any) {
  const { filename, mimetype } = data.data
  const msg = appStore.addMessage(filename, getMessageType(mimetype))
  socket.emit('new-message', msg)
  nextTick(() => {
    scrollToBottom()
  })
}

function onClose() {
  appStore.clearCurrentChat()
}

async function checkFileStatus(file: string): Promise<FileStatus> {
  try {
    const response = await fetch(formatFileUrl(file), {
      method: 'HEAD'
    })
    return {
      file,
      download: response.ok
    }
  } catch {
    return {
      file,
      download: false
    }
  }
}

watchEffect(async () => {
  if (visible.value) {
    socket.emit('join-channel', appStore.currentChannelId)
    appStore.setMessagesAsRead()
    const promises = appStore.currentChatMessages
      ?.filter(m => m.type !== 'text')
      ?.map(v => checkFileStatus(v.content))

    fileStatus.value = await Promise.all(promises)
  }
})

onMounted(() => {
  socket.on('new-message', (msg: Message) => {
    if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
    appStore.messages[msg.cid].push(msg)
    nextTick(() => {
      scrollToBottom()
    })
  })
})

onBeforeUnmount(() => {
  socket.off('join-channel')
  socket.off('new-message')
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
}

.message div {
  width: fit-content;
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
