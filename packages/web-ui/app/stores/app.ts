export const useAppStore = defineStore(
  'app',
  () => {
    const userInfo = ref<User>({
      id: '',
      username: ''
    })

    function setUserInfo(user: User) {
      userInfo.value = user
    }

    async function fetchUser(id: string) {
      const { data: res } = await $fetch<{ data: User }>(`/api/user/${id}`)
      return res
    }

    async function updateUser({ id, username }: User) {
      const { data: res } = await $fetch<{ data: User }>(`/api/user/${id}`, {
        method: 'put',
        body: { username }
      })
      return res
    }

    const users = ref<User[]>([])
    /** online users */
    const rawOnlineUsers = ref<User[]>([])
    /** online users(ignore self) */
    const onlineUsers = computed(() => {
      return rawOnlineUsers.value.filter(user => user.id !== userInfo.value.id)
    })

    /** has chat history or online users(ignore self)  */
    const hasChatHistoryOrOnlineUsers = computed(() => {
      const offlineUsers = users.value
        .filter(user => user.id !== userInfo.value.id)
        .filter(user => !onlineUsers.value.some(u => u.id === user.id))

      const hasChatHistoryOfflineUsers = offlineUsers.filter(user =>
        Object.keys(messages.value).includes(generateChatId(user.id))
      )

      return [...onlineUsers.value, ...hasChatHistoryOfflineUsers]
    })

    async function fetchUsers() {
      const { data: res } = await $fetch<{ data: User[] }>('/api/users')
      return res
    }

    function setUsers(newUsers: User[]) {
      users.value = newUsers
    }

    function setRawOnlineUsers(newUsers: User[]) {
      rawOnlineUsers.value = newUsers
    }

    async function createUser(username: string) {
      const { data: res } = await $fetch<{ data: User }>('/api/user', {
        method: 'post',
        body: { username }
      })
      return res
    }

    const currentChatUser = ref<User>({
      id: '',
      username: ''
    })

    function setCurrentChatUser(userOrId: User | string) {
      if (typeof userOrId === 'string') {
        const user = users.value.find(user => user.id === userOrId)
        if (user) currentChatUser.value = user
      } else {
        currentChatUser.value = userOrId
      }
    }

    function clearCurrentChatUser() {
      setCurrentChatUser({
        id: '',
        username: ''
      })
    }

    const currentChatIsOnline = computed(() => {
      return onlineUsers.value.map(u => u.id).includes(currentChatUser.value.id)
    })

    function validateUid(uid: string) {
      return users.value.some(user => user.id === uid)
    }

    function generateChatId(userId: string) {
      if (userId === GROUP_CHAT_ID) return userId
      return [userId, userInfo.value.id].sort().join('-')
    }

    const currentChatId = computed(() => generateChatId(currentChatUser.value.id))

    const messages = ref<Record<string, Message[]>>({})

    const currentChatMessages = computed(() => messages.value[currentChatId.value] ?? [])

    function createMessage(msg: Partial<Message>): Message {
      return {
        mid: `${Date.now()}-${randomId()}`,
        cid: currentChatId.value,
        sender: userInfo.value.id,
        receiver: currentChatUser.value.id,
        time: Date.now(),
        content: '',
        type: 'text',
        ...msg
      }
    }

    function addMessage(
      content: string,
      options: Pick<Message, 'type' | 'payload'> = { type: 'text' }
    ) {
      const msg = createMessage({ content, ...options })
      if (!messages.value[currentChatId.value]) messages.value[currentChatId.value] = []
      messages.value[currentChatId.value]!.push(msg)
      return msg
    }

    function deleteMessage(mid: string) {
      const msgs = messages.value[currentChatId.value]
      if (msgs?.length) {
        messages.value[currentChatId.value] = msgs.filter(msg => msg.mid !== mid)
      }
    }

    function cleanUselessChat() {
      const userIds = users.value.map(user => user.id)
      Object.keys(messages.value).forEach(cid => {
        if (cid === GROUP_CHAT_ID) return
        if (!userIds.some(userId => generateChatId(userId) === cid)) {
          Reflect.deleteProperty(messages.value, cid)
        }
      })
    }

    function deleteChatByUserId(userId: string) {
      const cid = generateChatId(userId)
      if (messages.value[cid]) {
        Reflect.deleteProperty(messages.value, cid)
      }
    }

    function getMessage(mid: string) {
      return messages.value[currentChatId.value]?.find(msg => msg.mid === mid)
    }

    function setMessagesAsRead() {
      messages.value[currentChatId.value]?.forEach(msg => {
        if (msg.sender === currentChatUser.value.id && !msg.read) {
          msg.read = true
        }
      })
    }

    const unreadMessagesCount = computed(() => {
      return Object.entries(messages.value).reduce(
        (acc, [cid, msgs]) => {
          const unread = msgs.filter(msg => !msg.read && msg.sender !== userInfo.value.id).length
          if (unread > 0) {
            acc[cid] = unread
          }
          return acc
        },
        {} as Record<string, number>
      )
    })

    async function createGroupMessage(msg: Message, onSent?: () => void) {
      const results: Record<string, any> = {}
      const { data } = await $fetch<{ data: Message }>('/api/group_chat/message', {
        method: 'POST',
        body: msg
      })
      onSent?.()
      results[GROUP_CHAT_ID] = data

      if (!aiModelConfig.value.enable) return results

      const prefix = getStartingPrefix(msg.content, availableMentions, v => `/${v.value} `)
      if (prefix?.matched) {
        const res = await $fetch<any>('/api/ai/chat', {
          method: 'POST',
          body: {
            user: userInfo.value.id,
            prompt: `根据[指令]和[输入]进行回复，回复内容仅限简洁,若携带[上下文]，还需要结合上下文进行回复。
            [指令]：${prefix.item.command}，[输入]：${msg.content}，
            ${prefix.item.context ? `[上下文]：${JSON.stringify(currentChatMessages.value)}` : ''}`
          }
        })
        results[prefix.item.value] = res.data
      }

      return results
    }

    async function syncGroupMessages() {
      const { data: res } = await $fetch<{ data: Message[] }>('/api/group_chat/messages')
      messages.value[GROUP_CHAT_ID] = res
    }

    function clearGroupMessages() {
      messages.value[GROUP_CHAT_ID] = []
    }

    const aiModelConfig = ref({
      enable: false,
      model: 'unknown'
    })

    async function getAiModelConfig() {
      const { data } = await $fetch<{ data: any }>('/api/ai')
      aiModelConfig.value = data
      return {
        enable: data.enable,
        model: data.model
      }
    }

    return {
      userInfo,
      setUserInfo,
      fetchUser,
      updateUser,
      users,
      setUsers,
      rawOnlineUsers,
      setRawOnlineUsers,
      onlineUsers,
      hasChatHistoryOrOnlineUsers,
      fetchUsers,
      createUser,
      currentChatUser,
      setCurrentChatUser,
      clearCurrentChatUser,
      currentChatIsOnline,
      currentChatId,
      generateChatId,
      messages,
      currentChatMessages,
      deleteChatByUserId,
      createMessage,
      getMessage,
      addMessage,
      deleteMessage,
      setMessagesAsRead,
      cleanUselessChat,
      unreadMessagesCount,
      validateUid,
      createGroupMessage,
      syncGroupMessages,
      clearGroupMessages,

      aiModelConfig,
      getAiModelConfig
    }
  },
  {
    persist: true
  }
)
