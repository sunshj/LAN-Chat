<template>
  <ElDrawer v-model="visible" class="chat-drawer" direction="btt" size="100%" @closed="onClose">
    <template #header>
      <div class="flex flex-col items-center gap-2">
        <ElBadge
          is-dot
          :type="currentChatIsOnline ? 'success' : 'danger'"
          :offset="[-10, 10]"
          :badge-style="{ width: '14px', height: '14px' }"
        >
          <Avatar :id="appStore.currentChatUser.id" />
        </ElBadge>
        <div>{{ appStore.currentChatUser.username }}</div>
      </div>
    </template>
    <div class="h-full w-full flex flex-col items-center gap-2">
      <div ref="messageRef" class="relative mb-14 w-full flex-1 overflow-y-auto bg-gray-2">
        <div class="h-full flex-1 p-10px">
          <div
            v-for="{ time, content, sender, type, mid } in appStore.currentChatMessages"
            :key="time"
            :class="sender === appStore.userInfo.id ? 'flex justify-end' : 'flex'"
          >
            <div
              v-click-outside="onClickOutside"
              :class="['message', sender === appStore.userInfo.id ? 'sender' : 'receiver']"
              @contextmenu.prevent="e => showPopover(e, mid)"
            >
              <div v-if="type === 'text'">
                <Markdown
                  v-if="isMarkdownValue(content)"
                  :value="content"
                  @loaded="scrollToBottom"
                />

                <div v-else>{{ content }}</div>
              </div>

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
                    <IconDownload />
                  </el-button>
                </a>
              </div>
              <p class="relative block w-full text-end text-xs text-[#777]">
                {{ formatTimeAgo(new Date(time)) }}
              </p>
            </div>
          </div>
          <el-popover
            ref="popoverRef"
            :visible="popoverVisible"
            :virtual-ref="buttonRef"
            trigger="contextmenu"
            virtual-triggering
            :popper-style="{
              padding: '2px',
              display: 'flex',
              'flex-direction': 'column',
              'justify-content': 'center'
            }"
            @hide="onPopoverHide"
          >
            <el-button
              v-if="currentSelectMessage?.type === 'image'"
              type="primary"
              class="w-full"
              text
              bg
              @contextmenu.prevent
              @click="downloadImage(currentSelectMessage)"
            >
              下载图片
            </el-button>
            <el-button
              type="danger"
              class="w-full"
              text
              bg
              @contextmenu.prevent
              @click="confirmDeleteMessage()"
            >
              删除消息
            </el-button>
          </el-popover>
        </div>
        <div
          class="fixed bottom-0 min-h-14 w-full flex items-start justify-around gap-2 bg-white p-2"
        >
          <div
            :class="[
              'absolute inset-0 z-10 h-1 w-full',
              uploadPercentage > 0 ? 'bg-green-500' : ''
            ]"
            :style="{
              translate: `-${100 - uploadPercentage}%`
            }"
          />

          <el-upload
            :show-file-list="false"
            action="/api/upload"
            :on-progress="onUploadProgress"
            :on-success="onUploadSuccess"
          >
            <el-button plain size="large">
              <IconUpload class="text-xl" />
            </el-button>
          </el-upload>
          <div class="flex-1">
            <ElInput
              v-model="message"
              type="textarea"
              :autosize="{
                minRows: 1.5,
                maxRows: 6
              }"
              resize="none"
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
import { type UploadProgressEvent, ClickOutside as vClickOutside } from 'element-plus'
import { type Message, type MessageType, useAppStore } from '../stores'
import { downloadFile, getOriginalFilename, isMarkdownValue, socketKey } from '../utils'
import MyWorker from '../utils/worker.js?worker'

const worker: Worker = new MyWorker()

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

const scrollToBottom = useDebounceFn(() => {
  const { scrollHeight, clientHeight, scrollTop } = messageRef.value!
  if (scrollHeight - clientHeight - scrollTop > 20) {
    messageRef.value?.scrollTo(0, scrollHeight - clientHeight)
  }
})

const popoverVisible = ref(false)
const buttonRef = ref(null)
const popoverRef = ref<any>(null)
const currentSelectMid = ref('')

const currentSelectMessage = computed(() => appStore.getMessage(currentSelectMid.value))

const showPopover = (e: any, mid: string) => {
  currentSelectMid.value = mid
  buttonRef.value = e.target
  popoverVisible.value = true
}

const onClickOutside = (e: any) => {
  if (popoverVisible.value && !popoverRef.value?.popperRef?.contentRef?.contains(e.target)) {
    popoverVisible.value = false
  }
}

function onPopoverHide() {
  buttonRef.value = null
  popoverRef.value = null
  currentSelectMid.value = ''
}

function downloadImage(imageMsg: Message) {
  const url = formatFileUrl(imageMsg.content)
  const filename = getOriginalFilename(imageMsg.content)
  popoverVisible.value = false
  downloadFile(url, filename)
}

function confirmDeleteMessage() {
  ElMessageBox.confirm('确定要删除这条消息吗？', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '算了',
    type: 'warning'
  }).then(() => {
    deleteMessage()
  })
}

function deleteMessage() {
  popoverVisible.value = false
  nextTick(() => {
    appStore.deleteMessage(currentSelectMid.value)
  })
}

function send() {
  if (!message.value.trim()) return
  const msg = appStore.addMessage(message.value)
  socket.emit('new-message', msg)
  message.value = ''

  nextTick(() => {
    scrollToBottom()
  })
}

const currentChatIsOnline = computed(() => {
  return appStore.onlineUsers.map(u => u.id).includes(appStore.currentChatUser.id)
})

function getMessageType(mimetype: string): MessageType {
  if (mimetype.includes('image')) return 'image'
  if (mimetype.includes('video')) return 'video'
  if (mimetype.includes('audio')) return 'audio'
  return 'file'
}

const uploadPercentage = ref(0)

function onUploadProgress(evt: UploadProgressEvent) {
  uploadPercentage.value = Number.parseFloat(evt.percent.toFixed(2))
  if (evt.percent === 100) {
    uploadPercentage.value = 0
  }
}

function onUploadSuccess(res: any) {
  const { filename, mimetype } = res.data
  const msg = appStore.addMessage(filename, getMessageType(mimetype))
  fileStatus.value.push({ file: msg.content, download: true })
  socket.emit('new-message', msg)
  nextTick(() => {
    scrollToBottom()
  })
}

function onClose() {
  appStore.clearCurrentChatUser()
}

watch(visible, value => {
  if (value && appStore.currentChatMessages.length > 0) {
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
    })
  }
})

onMounted(() => {
  socket.on('new-message', (msg: Message) => {
    if (msg.receiver === appStore.userInfo.id && msg.sender === appStore.currentChatUser.id) {
      msg.read = true
    }
    if (!appStore.messages[msg.cid]) appStore.messages[msg.cid] = []
    appStore.messages[msg.cid].push(msg)

    if (msg.type !== 'text') {
      fileStatus.value.push({ file: msg.content, download: true })
    }

    nextTick(() => {
      scrollToBottom()
    })
  })

  worker.addEventListener('message', event => {
    const { type, payload } = event.data
    if (type === 'check-file-reply') {
      fileStatus.value = payload
    }
  })
})

onBeforeUnmount(() => {
  socket.off('new-message')
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

.el-button + .el-button {
  margin-left: 0;
}
</style>

<style>
.chat-drawer .el-drawer__body {
  overflow: hidden;
  padding: 0;
}
</style>
