export const useFileStore = defineStore(
  'file',
  () => {
    const fileStatus = ref<FileStatus[]>([])

    function setFileStatus(newFileStatus: FileStatus[]) {
      fileStatus.value = newFileStatus
    }

    return {
      fileStatus,
      setFileStatus
    }
  },
  {
    persist: {
      pick: ['fileStatus']
    }
  }
)
