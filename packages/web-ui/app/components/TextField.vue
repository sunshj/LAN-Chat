<template>
  <ElMention
    ref="inputRef"
    v-model="message"
    type="textarea"
    :autosize="{
      minRows: 1.5,
      maxRows: 6
    }"
    resize="none"
    :placeholder="placeholder"
    :prefix="['/']"
    :options="mentionOptions"
    @search="handleSearch"
    @paste="handlePaste"
    @keydown.ctrl.enter="emit('enter', message)"
  />
</template>

<script setup lang="ts">
import type { MentionInstance, MentionOption } from 'element-plus'

const appStore = useAppStore()

const placeholder = computed(() => {
  return `${appStore.aiModelConfig.enable ? '/ 启用 AI 命令，' : ''}Ctrl + Enter 发送消息`
})

const mentionData: Record<string, MentionOption[]> = {
  '/': availableMentions
}

const mentionOptions = ref<MentionOption[]>([])

function handleSearch(_: string, prefix: string) {
  mentionOptions.value = (mentionData[prefix] || []).map(({ label, value }) => ({
    label,
    value
  }))
}

const inputRef = ref<MentionInstance | null>(null)

export interface TextFieldExposed {
  focus: () => void
  clear: () => void
}

defineExpose<TextFieldExposed>({
  focus() {
    inputRef.value?.input?.textarea?.setAttribute('readonly', 'readonly')
    inputRef.value?.input?.focus()
    setTimeout(() => {
      inputRef.value?.input?.textarea?.removeAttribute('readonly')
    }, 200)
  },
  clear() {
    message.value = ''
  }
})

const message = defineModel<string>({ required: true })

const props = defineProps<{
  onUploadProgress?: (event: any) => void
  onUploadSuccess?: (res: UploadFileResult, ...args: any[]) => void
}>()

const emit = defineEmits<{
  (e: 'enter', message: string): void
}>()

async function handlePaste(e: ClipboardEvent) {
  if (e.clipboardData?.files?.length) {
    e.preventDefault()

    const files = e.clipboardData?.files
    for (const file of files) {
      const res = await uploadFile(file, props.onUploadProgress)

      props.onUploadSuccess?.(res, { raw: file })
    }
  }
}
</script>
