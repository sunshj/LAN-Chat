<template>
  <div class="relative aspect-video max-w-40vw overflow-hidden rounded-lg lt-sm:max-w-none">
    <el-image :src="props.cover" class="h-full min-w-40vw w-full">
      <template #error>
        <div class="h-full w-full flex cursor-auto justify-center bg-gray-1 text-gray-400">
          封面加载失败
        </div>
      </template>
    </el-image>

    <IconVideoPlay
      class="absolute left-1/2 top-1/2 cursor-pointer rounded-full text-5xl text-amber transition-all -translate-1/2 hover:scale-110"
      @click="showVideo(props.url)"
    />

    <div class="absolute bottom-0 left-0 w-full truncate bg-black p-2 text-xs text-white">
      {{ getOriginalFilename(props.url) }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  cover?: string
}>()

function showVideo(url: string) {
  ElMessageBox({
    title: getOriginalFilename(url),
    message() {
      return h('video', {
        class: 'w-full',
        src: url,
        controls: true,
        autoplay: true
      })
    },
    showConfirmButton: false,
    closeOnClickModal: false,
    customClass: 'video-message-box',
    closeOnPressEscape: true,
    draggable: true
  })
}
</script>

<style>
.el-overlay-message-box:has(.video-message-box) {
  padding: 8px;
}

.el-message-box.video-message-box {
  max-width: 60%;
}

@media (max-width: 960px) {
  .el-message-box.video-message-box {
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .el-message-box.video-message-box {
    max-width: 100%;
  }
}

.video-message-box .el-message-box__message {
  width: 100%;
}
</style>
