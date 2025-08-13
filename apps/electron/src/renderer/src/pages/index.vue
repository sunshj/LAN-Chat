<template>
  <div class="flex flex-col gap-2 p-2">
    <ElCard shadow="never">
      <ElForm :model="appStore.settings.server" label-width="auto" class="max-w-full w-full">
        <div class="w-full flex justify-between">
          <ElFormItem label="PORT">
            <ElInput
              v-model.number="appStore.settings.server.port"
              :disabled="appStore.isRunning"
              type="number"
              :formatter="value => Math.min(Math.max(value, 1), 65535)"
              :parser="value => Math.min(Math.max(value, 1), 65535)"
            />
          </ElFormItem>
          <div>
            <ElButton v-if="!appStore.isRunning" type="primary" @click="startServer">
              Start
            </ElButton>
            <ElButton v-else type="danger" @click="stopServer">Stop</ElButton>
          </div>
        </div>
        <ElFormItem label="IP">
          <ElSelect
            v-model="appStore.settings.server.host"
            :disabled="appStore.isRunning"
            remote
            :remote-method="appStore.getIPAddresses"
          >
            <ElOption
              v-for="item in appStore.ipAddresses"
              :key="item"
              :label="item"
              :value="item"
            />
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
        visible: !appStore.isRunning,
        text: 'Server is NOT running',
        className: 'text-blue-500'
      }"
      shadow="never"
      class="w-full flex justify-center"
    >
      <img draggable="false" width="200" height="200" :src="qrcode" alt="qrcode" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { client } from '../client'
import { vOverlay } from '../directives/overlay'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const { copied, copy } = useClipboard()

const url = computed(
  () => `http://${appStore.settings.server.host}:${appStore.settings.server.port}`
)
const qrcode = useQRCode(url)

async function open(url: string) {
  await client.openExternalUrl(url)
}

const startServer = useThrottleFn(appStore.startServer, 1000)
const stopServer = useThrottleFn(appStore.stopServer, 1000)

onBeforeMount(() => {
  appStore.syncSettings()
  appStore.getIPAddresses()
})
</script>
