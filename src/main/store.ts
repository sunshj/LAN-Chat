import Store from 'electron-store'

interface User {
  id: string
  username: string
}

const store = new Store<{
  users: User[]
}>({
  name: 'stores',
  defaults: {
    users: []
  }
})

export const users = {
  findMany() {
    return store.store.users
  },
  findOne(id: string) {
    return store.store.users?.find(user => user.id === id) ?? null
  },
  mutation(id: string, values: Omit<User, 'id'>) {
    store.set('users', [
      ...store.get('users', []),
      {
        id,
        ...values
      }
    ])

    return { id, ...values }
  },
  deleteMany() {
    const count = store.get('users', []).length
    store.set('users', [])
    return { count }
  }
}
