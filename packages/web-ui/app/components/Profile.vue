<template>
  <ElDrawer v-model="visible" direction="btt" size="100%" @close="onDrawerClose">
    <div class="h-full w-full flex flex-col items-center gap-2 p-2">
      <Avatar :id="appStore.userInfo.id" />

      <div v-if="editable" class="flex items-center gap-2">
        <ElInput
          ref="inputRef"
          v-model="appStore.userInfo.username"
          size="small"
          placeholder="Username"
          @keydown.enter="saveProfile()"
        />
        <div class="cursor-pointer text-blue" @click="saveProfile()">Save</div>
      </div>
      <div v-else class="flex items-center gap-2">
        <div>{{ appStore.userInfo.username }}</div>
        <div class="cursor-pointer text-blue" @click="editable = true">Edit</div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
const appStore = useAppStore()
const { $socket } = useNuxtApp()

const visible = defineModel<boolean>({
  default: false,
  required: true
})

const inputRef = ref<HTMLInputElement | null>(null)
const editable = ref(false)

watch(editable, val => {
  if (val) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

function onDrawerClose() {
  editable.value = false
}

async function saveProfile() {
  editable.value = false
  await appStore.updateUser(appStore.userInfo)
  $socket.emit('$get-users')
}
</script>
