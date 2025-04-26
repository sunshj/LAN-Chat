import { useZIndex } from 'element-plus'

interface ChatMessageOptions {
  isGroupChat?: boolean
  onNewMessage: () => void
  onBeforeSendMessage?: () => boolean
  onSendMessage?: (msg: Message) => Awaitable<void>
  focusInput?: () => void
}

export function useChatMessage(options: ChatMessageOptions) {
  const appStore = useAppStore()
  const { $socket, $contextmenu } = useNuxtApp()

  const event: SocketEventName = options.isGroupChat ? '$new-group-message' : '$new-message'

  const message = ref('')

  const sendMessage = useThrottleFn(async () => {
    if (!message.value.trim()) return
    const isSuccess = options.onBeforeSendMessage?.()
    if (!isSuccess) return
    const msg = appStore.addMessage(message.value)
    $socket.emit(event, msg)
    message.value = ''

    await options.onSendMessage?.(msg)
  }, 2000)

  $socket.on(event, options.onNewMessage!)

  onMounted(() => {
    if (appStore.currentChatMessages.length > 0) {
      appStore.setMessagesAsRead()
    }
  })

  onBeforeUnmount(() => {
    message.value = ''
    $socket.off(event, options.onNewMessage!)
  })

  // contextmenu
  const currentSelectMid = ref('')
  const currentSelectMessage = computed(() => appStore.getMessage(currentSelectMid.value))

  const { nextZIndex } = useZIndex()
  const { text: selectedText } = useTextSelection()

  const { copy, copied } = useClipboard({
    legacy: true
  })

  async function copyText(content?: string) {
    if (!content) return
    await copy(content)
    if (copied.value) {
      ElMessage.success('Copied')
    } else {
      ElMessage.error('Copy failed')
    }
  }

  function handleContextMenu(e: MouseEvent, mid: string) {
    currentSelectMid.value = mid
    $contextmenu.showContextMenu({
      x: e.x,
      y: e.y,
      zIndex: nextZIndex(),
      items: [
        {
          label: '回复',
          onClick() {
            message.value = `---md\n> <a href="#${currentSelectMessage.value?.mid}">${removeMarkdownSign(currentSelectMessage.value!.content)}</a>\n\n`
            options?.focusInput?.()
          }
        },
        {
          label: selectedText.value ? '复制选中' : '复制',
          hidden: currentSelectMessage.value?.type !== 'text' && !selectedText.value,
          async onClick() {
            const text = selectedText.value || currentSelectMessage.value?.content
            await copyText(text)
            window.getSelection()?.removeAllRanges()
          }
        },
        {
          label: '下载',
          hidden: !['image', 'audio', 'video'].includes(currentSelectMessage.value!.type),
          onClick() {
            downloadMsgFile(currentSelectMessage.value!)
          }
        },
        {
          label: '删除',
          hidden: options.isGroupChat,
          onClick() {
            ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
              type: 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '算了'
            }).then(() => {
              nextTick(() => {
                appStore.deleteMessage(currentSelectMid.value)
              })
            })
          }
        }
      ]
    })
  }

  return {
    message,
    sendMessage,
    handleContextMenu
  }
}
