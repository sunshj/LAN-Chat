<template>
  <div class="flex flex-col gap-2 p-2 text-sm">
    <ElCard shadow="never">
      <ElForm :model="appStore.settings" label-width="auto" class="max-w-full w-full">
        <ElFormItem label="上传文件路径">
          <ElInput
            v-model="appStore.settings.uploadsDir"
            clearable
            placeholder="Please select directory"
            @change="saveSettings"
          >
            <template #append>
              <ElButton type="primary" @click="appStore.selectUploadsDir()"> Select </ElButton>
            </template>
          </ElInput>
        </ElFormItem>

        <ElFormItem>
          <template #label>
            <ElTooltip placement="top" content="服务启动时是否弹出通知">
              <div>服务启动通知</div>
            </ElTooltip>
          </template>
          <ElSwitch
            v-model="appStore.settings.notificationAfterStartServer"
            @change="saveSettings"
          />
        </ElFormItem>

        <ElFormItem label="启动后检测更新">
          <ElSwitch v-model="appStore.settings.autoCheckUpgrade" @change="saveSettings" />
        </ElFormItem>
        <ElFormItem label="开机自启动">
          <ElSwitch v-model="appStore.settings.autoLaunch" @change="saveSettings" />
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <div class="flex flex-col gap-10px">
        <div class="flex items-center justify-between">
          <div>启用 AI</div>
          <ElSwitch v-model="appStore.settings.enableAI" @change="saveSettings" />
        </div>

        <template v-if="appStore.settings.enableAI">
          <div class="flex items-center justify-between gap-2">
            <div>Base URL</div>
            <ElInput v-model.trim="aiSettings.baseUrl" @change="saveAISettings" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <div>API Key</div>
            <ElInput
              v-model.trim="aiSettings.apiKey"
              show-password
              type="password"
              @change="saveAISettings"
            />
          </div>
          <div class="flex items-center justify-between gap-2">
            <div>Model</div>
            <ElAutocomplete
              v-model.trim="aiSettings.model"
              :fetch-suggestions="querySearchAIModels"
              clearable
              @change="saveAISettings()"
              @select="saveAISettings()"
            />
          </div>
        </template>
      </div>
    </ElCard>

    <ElCard shadow="never">
      <div class="flex flex-col gap-10px">
        <div class="flex items-center justify-between">
          <div>删除上传文件</div>
          <ElButton type="danger" @click="cleanUploads()">
            <IconDelete />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>清空用户及聊天数据</div>
          <ElButton type="danger" @click="cleanAppData()">
            <IconDelete />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>清空所有数据</div>
          <ElButton type="danger" @click="cleanStores()">
            <IconDelete />
          </ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never">
      <div class="flex flex-col gap-10px">
        <div class="flex items-center justify-between">
          <div>打开开发者工具</div>
          <ElButton type="primary" @click="openDevtools()">
            <IconPosition />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>查看应用数据</div>
          <ElButton type="primary" @click="openStoresData()">
            <IconPosition />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>版本信息</div>
          <ElButton type="primary" @click="showVersionData()">
            <IconPosition />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>检查更新</div>
          <ElButton type="warning" @click="checkForUpgrade()">
            <IconUpgrade />
          </ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>退出</div>
          <ElButton type="danger" @click="exitApp()">
            <IconExit />
          </ElButton>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

function cleanUploads() {
  ElMessageBox.confirm('Are you sure to clean uploads?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await window.api.cleanUploads()
      ElMessage.success('Clean uploads success')
    })
    .catch(() => {
      ElMessage.info('Clean uploads canceled')
    })
}

function cleanStores() {
  ElMessageBox.confirm('Are you sure to clean all stores?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await window.api.cleanStores()
    appStore.syncSettings()
    ElMessage.success('Clean stores success')
  })
}

function cleanAppData() {
  ElMessageBox.confirm('Are you sure to clean all users and messages data?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await window.api.cleanAppData()
    appStore.syncSettings()
    ElMessage.success('Clean app data success')
  })
}

const aiSettings = ref({
  baseUrl: '',
  apiKey: '',
  model: ''
})

const models = ref<Array<{ value: string }>>([])

async function querySearchAIModels(queryString: string, cb: any) {
  models.value = await getAIModels()
  const results = queryString
    ? models.value.filter(item => item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
    : models.value
  return cb(results)
}

async function getAISettings() {
  aiSettings.value = await window.api.getAISettings()
}

async function getAIModels() {
  const data: string[] = await window.api.getAIModels()
  return data.map(item => ({ value: item }))
}

const saveAISettings = useDebounceFn(async () => {
  console.log('saveAISettings', aiSettings.value)
  await window.api.saveAISettings({ ...aiSettings.value })
}, 500)

const saveSettings = useDebounceFn(appStore.saveSettings, 500)
const openDevtools = useThrottleFn(window.api.openDevtools, 2000)
const openStoresData = useThrottleFn(window.api.openStoresData, 2000)
const checkForUpgrade = useThrottleFn(window.api.checkForUpgrade, 2000)
const showVersionData = useThrottleFn(window.api.showVersionData, 2000)
const exitApp = useThrottleFn(window.api.exitApp, 2000)

onBeforeMount(() => {
  appStore.syncSettings()
  getAISettings()
})
</script>

<style scoped>
.el-form-item {
  margin-bottom: 10px;
}
</style>
