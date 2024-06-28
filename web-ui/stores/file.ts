export const useFileStore = defineStore(
  'file',
  () => {
    const fileStatus = ref<FileStatus[]>([])

    function setFileStatus(newFileStatus: FileStatus[]) {
      fileStatus.value = newFileStatus
    }

    const markdown = ref<MarkdownParse[]>([])

    function setMarkdown(md: MarkdownParse[] | ((prev: MarkdownParse[]) => MarkdownParse[])) {
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
      paths: ['fileStatus']
    }
  }
)
