<template>
  <div :class="props.msg.sender === appStore.userInfo.id ? 'flex justify-end' : 'flex'">
    <div
      :class="['message', props.msg.sender === appStore.userInfo.id ? 'sender' : 'receiver']"
      @contextmenu.prevent="$emit('contextmenu', $event, props.msg.mid)"
      @click.stop
    >
      <ChatPreviewer :message="props.msg" @loaded="$emit('loaded')" />
      <p class="relative block w-full text-end text-xs text-[#777]">
        {{ formatTimeAgo(new Date(props.msg.time)) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'

const appStore = useAppStore()

const props = defineProps<{
  msg: Message
}>()

defineEmits<{
  loaded: []
  contextmenu: [event: MouseEvent, mid: string]
}>()
</script>

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
