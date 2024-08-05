import { z } from 'zod'
import { zodValidator } from 'express-validate-kit'

export const updateUserDto = zodValidator({
  body: z.object({
    username: z.string({ message: 'username is required' }).min(1)
  }),
  params: z.object({
    id: z.string()
  })
})

export const createUserDto = zodValidator({
  body: z.object({
    username: z.string({ message: 'username is required' }).min(1)
  })
})
