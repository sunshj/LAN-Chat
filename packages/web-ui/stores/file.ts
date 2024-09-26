export const useFileStore = defineStore(
  'file',
  () => {
    const fileStatus = ref<FileStatus[]>([])

    function setFileStatus(newFileStatus: FileStatus[]) {
      fileStatus.value = newFileStatus
    }

    const markdown = ref<ParsedMarkdown[]>([])

    function setMarkdown(md: ParsedMarkdown[] | ((prev: ParsedMarkdown[]) => ParsedMarkdown[])) {
      if (Array.isArray(md)) {
        markdown.value = toRaw(md)
      } else {
        markdown.value = unique(toRaw(md(toRaw(markdown.value))), 'id')
      }
    }

    return {
      fileStatus,
      setFileStatus,
      markdown,
      setMarkdown
    }
  },
  {
    persist: {
      pick: ['fileStatus']
    }
  }
)
