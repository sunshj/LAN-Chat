<template>
  <ElInput
    ref="inputRef"
    v-model="message"
    type="textarea"
    :autosize="{
      minRows: 1.5,
      maxRows: 6
    }"
    resize="none"
    placeholder="Ctrl + Enter to send"
    @paste="handlePaste"
    @keydown.ctrl.enter="emit('enter', message)"
  />
</template>

<script setup lang="ts">
import type { InputInstance } from 'element-plus'

const inputRef = ref<InputInstance | null>(null)

export interface TextFieldExposed {
  focus: () => void
  clear: () => void
}

defineExpose<TextFieldExposed>({
  focus() {
    inputRef.value?.textarea?.setAttribute('readonly', 'readonly')
    inputRef.value?.focus()
    setTimeout(() => {
      inputRef.value?.textarea?.removeAttribute('readonly')
    }, 200)
  },
  clear() {
    message.value = ''
  }
})

const message = defineModel<string>({
  required: true
})

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
