<template>
  <div v-if="type === 'text'">
    <Markdown
      v-if="isMarkdownValue(content)"
      :id="mid"
      :key="mid + type"
      :value="content"
      :is-sender="sender === appStore.userInfo.id"
      @loaded="emit('loaded')"
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

    <Audio v-else-if="type === 'audio'" :url="formatFileUrl(content)" :audio="payload?.audio" />

    <File v-else :url="formatFileUrl(content)" :filename="content" :error="props.error">
      <template #preview="scope">
        <Markdown
          :id="mid"
          :key="mid + type"
          :value="scope.content"
          :is-sender="sender === appStore.userInfo.id"
        />
      </template>
    </File>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: Message
  error?: string
}>()

const emit = defineEmits<{
  loaded: []
}>()

const { type, content, sender, payload, mid } = toRefs(props.message)

const appStore = useAppStore()
</script>
