<template>
  <div class="h-full w-full flex flex-col gap-2 border border-1px p-4">
    <ElCard shadow="never">
      <ElForm :model="form" label-width="auto" class="max-w-full w-full">
        <div class="w-full flex justify-between">
          <ElFormItem label="PORT">
            <ElInput
              v-model.number="form.port"
              :disabled="isRunning"
              type="number"
              :formatter="value => Math.min(Math.max(value, 1), 65535)"
              :parser="value => Math.min(Math.max(value, 1), 65535)"
            />
          </ElFormItem>
          <div>
            <ElButton v-if="!isRunning" type="primary" @click="startServer">Start</ElButton>
            <ElButton v-else type="danger" @click="stopServer">Stop</ElButton>
          </div>
        </div>
        <ElFormItem label="IP">
          <ElSelect
            v-model="form.host"
            :disabled="isRunning"
            remote
            :remote-method="remoteQueryNetworks"
          >
            <ElOption v-for="item in networks" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <div class="flex justify-between">
      <ElLink type="primary" :underline="false" class="my-2 flex justify-start" @click="open(url)">
        {{ url }}
      </ElLink>
      <ElButton bg text @click="copy(url)">
        {{ copied ? 'Copied!' : 'Copy' }}
      </ElButton>
    </div>

    <ElCard
      v-overlay="{
        visible: !isRunning,
        text: 'Server is NOT running',
        className: 'text-blue-500'
      }"
      shadow="never"
      class="w-full flex justify-center"
    >
      <img draggable="false" width="200" height="200" :src="qrcode" alt="qrcode" />
    </ElCard>

    <footer class="fixed bottom-0 left-0 w-full p-2 text-center">
      <div class="flex-center gap-2 text-sm">
        <a href="https://github.com/sunshj/LAN-Chat/releases" target="_blank">Download</a>
        |
        <a href="https://github.com/sunshj/LAN-Chat/issues" target="_blank">Issues</a>
        |
        <a href="https://github.com/sunshj/LAN-Chat" target="_blank">Source</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { vOverlay } from '../../shared'

const isRunning = ref(false)

const form = ref({
  port: 3000,
  host: ''
})

const networks = ref<string[]>([])

const url = computed(() => `http://${form.value.host}:${form.value.port}`)

const qrcode = useQRCode(url)
const { copied, copy } = useClipboard()

async function remoteQueryNetworks() {
  networks.value = await window.api.getNetworks()
}

async function open(url: string) {
  await window.api.open(url)
}

async function startServer() {
  isRunning.value = await window.api.startServer(toRaw(form.value))
}

async function stopServer() {
  isRunning.value = await window.api.stopServer()
}

const title = useTitle(`LAN Chat`)

onMounted(async () => {
  const version = await window.api.getVersion()
  title.value = `LAN Chat v${version}`
  await remoteQueryNetworks()
  form.value.host = networks.value[0]
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
</style>
