<template>
  <div :class="props.msg.sender === appStore.userInfo.id ? 'flex justify-end' : 'flex gap-4'">
    <div v-if="isGroupChat && props.msg.sender !== appStore.userInfo.id" class="h-10 w-10">
      <Avatar :id="props.msg.sender" :size="35" @click="gotoPrivateChat()" />
    </div>

    <div class="max-w-full w-fit flex flex-col gap-1">
      <div v-if="isGroupChat" class="text-xs text-[#777]">{{ senderName }}</div>

      <div
        :id="props.msg.mid"
        :class="['message', props.msg.sender === appStore.userInfo.id ? 'sender' : 'receiver']"
        @contextmenu.prevent="$emit('contextmenu', $event, props.msg.mid)"
        @click.stop
      >
        <ChatPreviewer :message="props.msg" />
        <p class="relative block w-full text-end text-xs text-[#777]">
          {{ formatTimeAgo(new Date(props.msg.time)) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'

const appStore = useAppStore()
const router = useRouter()

const props = defineProps<{
  msg: Message
}>()

defineEmits<{
  contextmenu: [event: MouseEvent, mid: string]
}>()

const isGroupChat = computed(() => appStore.currentChatUser.id === GROUP_CHAT_ID)

const senderName = computed(() => {
  if (props.msg.sender === appStore.userInfo.id) return
  return appStore.users.find(user => user.id === props.msg.sender)?.username ?? props.msg.sender
})

function gotoPrivateChat() {
  router.push({
    path: '/chat',
    query: {
      uid: props.msg.sender
    }
  })
}
</script>

<style>
.vue-recycle-scroller__item-wrapper {
  overflow: unset;
}
</style>

<style scoped>
.message {
  position: relative;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: white;
  word-break: break-all;
  box-shadow: 0 0 1px #f2f3f4;
  max-width: 100%;
}

.message::before {
  position: absolute;
  top: 0;
  content: '';
  border: 10px solid transparent;
  border-top: 10px solid white;
}

.message.sender {
  background-color: #dcf8c6;
  border-top-right-radius: 0;
  margin-right: 2px;
}

.message.sender::before {
  border-top-color: #dcf8c6;
  right: -10px;
}

.message.receiver {
  border-top-left-radius: 0;
}

.message.receiver::before {
  left: -10px;
}
</style>
