<template>
  <ElConfigProvider>
    <div class="h-90% w-full overflow-y-auto">
      <RouterView />
    </div>
  </ElConfigProvider>

  <footer class="fixed bottom-0 left-0 w-full p-2 text-center">
    <div class="flex-center gap-2 text-sm">
      <a href="https://github.com/sunshj/LAN-Chat/releases" target="_blank">Download</a>
      |
      <a href="https://github.com/sunshj/LAN-Chat/issues" target="_blank">Issues</a>
      |
      <a href="https://github.com/sunshj/LAN-Chat" target="_blank">Source</a>
    </div>
  </footer>

  <div class="fixed bottom-0 left-0 p-2">
    <ElTooltip :content="tip">
      <ElButton circle @click="$router.push(targetPath)">
        <IconSetting v-if="route.path === '/'" />
        <IconBack v-else />
      </ElButton>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { client } from './client'

const route = useRoute()
const title = useTitle(`LAN Chat`)

const tip = computed(() => (route.path === '/' ? '设置' : '返回'))
const targetPath = computed(() => (route.path === '/' ? '/setting' : '/'))

onBeforeMount(async () => {
  const version = await client.getAppVersion()
  title.value = `LAN Chat v${version}`
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  background-color: #f3f4f5;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

::-webkit-scrollbar-track {
  background-color: #f3f4f5;
  border-radius: 4px;
}
</style>
