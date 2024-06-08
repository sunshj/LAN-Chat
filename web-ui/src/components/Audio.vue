<template>
  <div class="flex flex-col gap-2">
    <div>{{ getOriginalFilename(props.url) }}</div>
    <Aplayer :volume="0.4" :music="music" />
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error
import Aplayer from 'vue-aplayer-next'
import { formatFileUrl, getOriginalFilename } from '../utils'
import type { Message } from '../stores'

const props = defineProps<{
  url: string
  audio: NonNullable<Message['payload']>['audio']
}>()

const music = {
  src: props.url,
  pic: formatFileUrl(props.audio?.pic),
  title: props.audio?.artist ? `${props.audio?.title} -` : props.audio?.title,
  artist: ` ${props.audio?.artist}`
}
</script>

<style scoped>
.aplayer {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
}
</style>
