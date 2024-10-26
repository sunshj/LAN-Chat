<template>
  <div class="flex flex-col gap-2">
    <div>{{ getOriginalFilename(props.url) }}</div>
    <slot
      v-if="showPreviewSlot"
      name="preview"
      :url="props.url"
      :content="previewContent"
      :ext="fileExtension"
    />
    <ElButton
      v-if="supportPreview"
      :class="['w-full', showPreviewSlot && 'sticky bottom-0 left-0']"
      type="primary"
      @click="preview()"
    >
      <span v-if="!previewLoading">{{ showPreviewSlot ? '收起' : '预览' }}</span>
      <span v-else>Loading...</span>
    </ElButton>
    <a :href="props.url" :download="getOriginalFilename(props.url)">
      <ElButton class="w-full" type="success" :disabled="!supportDownload">
        <span v-if="pending">Checking...</span>
        <span v-else-if="!supportDownload">文件已失效</span>
        <IconDownload v-else />
      </ElButton>
    </a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  filename: string
}>()

const { data: fileStatus, pending } = useAsyncData(props.url, () => readFileStatus(props.filename))

const supportDownload = computed(() => fileStatus.value?.download)

const SUPPORT_PREVIEW_LANGS = ['vue', 'js', 'ts', 'json', 'css', 'html', 'yaml', 'yml']
const SUPPORT_PREVIEW_EXTENSIONS = ['md', 'txt', ...SUPPORT_PREVIEW_LANGS]

const fileExtension = computed(() => getFileExtension(props.url))
const supportPreview = computed(() => {
  return supportDownload.value && SUPPORT_PREVIEW_EXTENSIONS.includes(fileExtension.value)
})

const showPreviewSlot = ref(false)
const previewContent = ref('')
const previewLoading = ref(false)

async function preview() {
  if (showPreviewSlot.value) {
    showPreviewSlot.value = false
    return
  }

  previewLoading.value = true
  if (SUPPORT_PREVIEW_LANGS.includes(fileExtension.value) || fileExtension.value === 'txt') {
    const code = await readFileContent(props.url)
    previewContent.value = generateMarkdownCodeBlock(fileExtension.value, code)
  } else {
    previewContent.value = await readFileContent(props.url)
  }
  previewLoading.value = false
  showPreviewSlot.value = true
}
</script>
