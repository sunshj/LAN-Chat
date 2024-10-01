<template>
  <div class="h-full w-full flex flex-col gap-2 border border-1px p-2 text-sm">
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
          <ElSwitch v-model="appStore.settings.notification" @change="saveSettings" />
        </ElFormItem>

        <ElFormItem label="启动后检测更新">
          <ElSwitch v-model="appStore.settings.autoCheckUpgrade" @change="saveSettings" />
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never">
      <div class="flex flex-col gap-10px">
        <div class="flex items-center justify-between">
          <div>删除上传文件</div>
          <ElButton type="danger" @click="cleanUploads()">Clean</ElButton>
        </div>

        <div class="flex items-center justify-between">
          <div>清空应用数据</div>
          <ElButton type="danger" @click="cleanStores()">Clean</ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never">
      <div class="flex flex-col gap-10px">
        <div class="flex items-center justify-between">
          <div>Open DevTools</div>
          <ElButton type="primary" @click="openDevtools()">Open</ElButton>
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
  ElMessageBox.confirm('Are you sure to clean stores?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await window.api.cleanStores()
    ElMessage.success('Clean stores success')
  })
}

const saveSettings = useDebounceFn(appStore.saveSettings, 500)
const openDevtools = useThrottleFn(window.api.openDevtools, 2000)

onBeforeMount(() => {
  appStore.syncSettings()
})
</script>
