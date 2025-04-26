import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isRunning = ref(false)

  const server = ref({
    host: '',
    port: 3000
  })

  async function startServer() {
    isRunning.value = await window.api.startServer(toRaw(server.value))
  }

  async function stopServer() {
    isRunning.value = await window.api.stopServer()
  }

  const ipAddresses = ref<string[]>([])

  async function getIPAddresses() {
    ipAddresses.value = await window.api.getIPAddresses()
    server.value.host = ipAddresses.value[0]
  }

  const settings = ref({
    uploadsDir: '',
    notificationAfterStartServer: false,
    autoCheckUpgrade: false,
    autoLaunch: false,
    enableAI: false
  })

  async function syncSettings() {
    const data = await window.api.getSettings()
    settings.value = data
  }

  async function selectUploadsDir() {
    const dir = await window.api.openUploadsDir()
    if (dir) {
      settings.value.uploadsDir = dir
      saveSettings()
    }
  }

  async function resetSettings() {
    settings.value = await window.api.resetSettings()
    ElMessage.success('Settings reset')
  }

  async function saveSettings() {
    if (isRunning.value) {
      ElMessage.error('Server is running, please stop it first')
      await syncSettings()
      return
    }
    await window.api.saveSettings(toRaw(settings.value))
    ElMessage.success('Settings saved')
  }

  return {
    isRunning,
    server,
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
