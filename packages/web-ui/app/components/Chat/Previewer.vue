<template>
  <div v-if="type === 'text'">
    <PreviewMarkdown
      v-if="isMarkdownValue(content)"
      :key="mid"
      :value="removeMarkdownSign(content)"
    />

    <div v-else>{{ content }}</div>
  </div>

  <PreviewImage
    v-else-if="type === 'image'"
    :url="formatFileUrl(content)"
    :thumbnail="formatFileUrl(payload?.image?.thumbnail || content)"
  />

  <div v-else>
    <PreviewVideo
      v-if="type === 'video'"
      :cover="formatFileUrl(payload?.video?.cover)"
      :url="formatFileUrl(content)"
    />

    <PreviewAudio
      v-else-if="type === 'audio'"
      :url="formatFileUrl(content)"
      :audio="payload?.audio"
    />

    <PreviewFile v-else :url="formatFileUrl(content)" :filename="content" :error="props.error">
      <template #preview="scope">
        <PreviewMarkdown :value="scope.content" />
      </template>
    </PreviewFile>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: Message
  error?: string
}>()

const { mid, type, content, payload } = toRefs(props.message)
</script>
