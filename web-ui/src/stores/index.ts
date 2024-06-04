import axios from 'axios'
import { randomId } from '../utils'
import type { User } from '@prisma/client'

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file'
export interface Message {
  mid: string
  cid: string
  sender: string
  receiver: string
  type: MessageType
  content: string
  time: number
  read?: boolean
}

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
      const { data: res } = await axios.get<{ data: User }>(`/api/user/${id}`)
      return res.data
    }

    async function updateUser({ id, username }: User) {
      const { data: res } = await axios.put<{ data: User }>(`/api/user/${id}`, { username })
      return res.data
    }

    /** online users(ignore self) */
    const users = ref<User[]>([])

    async function fetchUsers() {
      const { data: res } = await axios.get<{ data: User[] }>('/api/users')
      return res.data
    }

    function setUsers(newUsers: User[]) {
      users.value = newUsers
    }

    async function createUser(username: string) {
      const { data: res } = await axios.post<{ data: User }>('/api/user', { username })
      return res.data
    }

    const currentChat = ref<User>({
      id: '',
      username: ''
    })

    function setCurrentChat(user: User) {
      currentChat.value = user
    }

    function clearCurrentChat() {
      setCurrentChat({
        id: '',
        username: ''
      })
    }

    function generateChannelId(userId: string) {
      return [userId, userInfo.value.id].sort().join('-')
    }

    const currentChannelId = computed(() => generateChannelId(currentChat.value.id))

    const messages = ref<Record<string, Message[]>>({})

    const currentChatMessages = computed(() => messages.value[currentChannelId.value] ?? [])

    function addMessage(content: string, type: MessageType = 'text') {
      const msg = {
        mid: `${Date.now()}-${randomId()}`,
        cid: currentChannelId.value,
        sender: userInfo.value.id,
        receiver: currentChat.value.id,
        time: Date.now(),
        content,
        type
      }
      if (!messages.value[currentChannelId.value]) messages.value[currentChannelId.value] = []
      messages.value[currentChannelId.value].push(msg)
      return msg
    }

    function deleteMessage(mid: string) {
      const msgs = messages.value[currentChannelId.value]
      if (msgs?.length > 0) {
        messages.value[currentChannelId.value] = msgs.filter(msg => msg.mid !== mid)
      }
    }

    function setMessagesAsRead() {
      messages.value[currentChannelId.value]?.forEach(msg => {
        if (msg.sender === currentChat.value.id && !msg.read) {
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

    return {
      userInfo,
      setUserInfo,
      fetchUser,
      updateUser,
      users,
      setUsers,
      fetchUsers,
      createUser,
      currentChat,
      setCurrentChat,
      clearCurrentChat,
      currentChannelId,
      generateChannelId,
      messages,
      currentChatMessages,
      addMessage,
      deleteMessage,
      setMessagesAsRead,
      unreadMessagesCount
    }
  },
  {
    persist: true
  }
)
