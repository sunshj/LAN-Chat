<template>
  <ElHeader class="h-15 w-full flex items-center justify-between bg-gray-100 px-4">
    <div>LAN Chat</div>

    <div class="flex items-center gap-2">
      <ElPopover placement="bottom" :width="200" trigger="click">
        <template #reference>
          <ElButton text>
            <IconInfo class="text-xl text-gray-500" />
          </ElButton>
        </template>

        <NuxtLink class="text-black no-underline" :href="gitCommitUrl" target="_blank">
          Built {{ builtTime }} ({{ shortenGitSha }})
        </NuxtLink>
      </ElPopover>
      <Avatar :id="appStore.userInfo.id" :size="40" @click="$emit('showProfile')" />
    </div>
  </ElHeader>
</template>

<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
const appStore = useAppStore()
const config = useRuntimeConfig()

defineEmits(['showProfile'])

const builtTime = formatTimeAgo(Number(config.public.buildTime))
const shortenGitSha = (config.public.gitSha as string).slice(0, 5)
const gitCommitUrl = `${config.public.repoUrl}/${config.public.gitSha}`
</script>
