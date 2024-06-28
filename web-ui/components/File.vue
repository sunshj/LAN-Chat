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
    <el-button
      v-if="supportPreview"
      :class="['w-full', showPreviewSlot && 'sticky bottom-0 left-0']"
      type="primary"
      @click="preview()"
    >
      {{ showPreviewSlot ? '收起' : '预览' }}
    </el-button>
    <a :href="props.url" :download="getOriginalFilename(props.url)">
      <el-button class="w-full" type="success" :disabled="!supportDownload">
        <span v-if="!supportDownload">文件已失效</span>
        <IconDownload v-else />
      </el-button>
    </a>
  </div>
</template>

<script setup lang="ts">
const { $fileWorker } = useNuxtApp()
const fileStore = useFileStore()

const props = defineProps<{
  url: string
  filename: string
}>()

const supportDownload = computed(() => {
  return fileStore.fileStatus.find(f => f.file === props.filename)?.download
})

const SUPPORT_PREVIEW_LANGS = ['vue', 'js', 'ts', 'json', 'css', 'html', 'yaml', 'yml']
const SUPPORT_PREVIEW_EXTENSIONS = ['md', 'txt', ...SUPPORT_PREVIEW_LANGS]

const fileExtension = computed(() => getFileExtension(props.url))
const supportPreview = computed(() => {
  return supportDownload.value && SUPPORT_PREVIEW_EXTENSIONS.includes(fileExtension.value)
})

const showPreviewSlot = ref(false)
const previewContent = ref('')

async function preview() {
  showPreviewSlot.value = !showPreviewSlot.value
  if (SUPPORT_PREVIEW_LANGS.includes(fileExtension.value) || fileExtension.value === 'txt') {
    const code = await getFileContent(props.url)
    previewContent.value = generateMarkdownCodeBlock(fileExtension.value, code)
  } else {
    previewContent.value = await getFileContent(props.url)
  }
}

const handleCheckFileReply = (event: MessageEvent) => {
  const { type, payload } = extractData(event)

  if (type === 'checkFileReply') {
    fileStore.setFileStatus(payload)
  }
}

onMounted(() => {
  $fileWorker.addEventListener('message', handleCheckFileReply)
})

onBeforeUnmount(() => {
  $fileWorker.removeEventListener('message', handleCheckFileReply)
})
</script>
