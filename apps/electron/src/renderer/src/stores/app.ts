import { defineStore } from 'pinia'
import { client } from '../client'

export const useAppStore = defineStore('app', () => {
  const isRunning = ref(false)

  async function startServer() {
    isRunning.value = await client.startServer(toRaw(settings.value.server))
  }

  async function stopServer() {
    isRunning.value = await client.stopServer()
  }

  const ipAddresses = ref<string[]>([])

  async function getIPAddresses() {
    ipAddresses.value = await client.getIpAddressList()
    settings.value.server.host = ipAddresses.value[0]
  }

  const settings = ref({
    server: {
      host: '127.0.0.1',
      port: 3000
    },
    uploadsDir: '',
    notificationAfterStartServer: false,
    autoCheckUpgrade: false,
    autoLaunch: false,
    enableAI: false
  })

  async function syncSettings() {
    const data = await client.getSettings()
    settings.value = data
  }

  async function selectUploadsDir() {
    const dir = await client.openUploadsDirectory()
    if (dir) {
      settings.value.uploadsDir = dir
      saveSettings()
    }
  }

  async function resetSettings() {
    settings.value = await client.resetSettings()
    ElMessage.success('Settings reset')
  }

  async function saveSettings() {
    if (isRunning.value) {
      ElMessage.error('Server is running, please stop it first')
      await syncSettings()
      return
    }
    await client.saveSettings(toRaw(settings.value))
    ElMessage.success('Settings saved')
  }

  return {
    isRunning,
    startServer,
    stopServer,

    ipAddresses,
    getIPAddresses,

    settings,
    syncSettings,
    resetSettings,
    saveSettings,

    selectUploadsDir
  }
})
