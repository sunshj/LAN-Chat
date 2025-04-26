import { z, type ZodError } from 'zod'

export function extractZodError(error: ZodError) {
  return error.errors.map(e => e.message).join(', ')
}

export const serverSchema = z.object({
  port: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .refine(n => n !== 443, 'Port 443 is not allowed'),
  host: z.string().min(1).ip({ version: 'v4' }).or(z.literal('localhost'))
})

export const userSchema = z.object({
  username: z.string({ message: 'username is required' }).min(1)
})

export const messageSchema = z.object({
  mid: z.string({ message: 'mid is required' }).min(1),
  cid: z.string({ message: 'cid is required' }).min(1),
  sender: z.string({ message: 'sender is required' }).min(1),
  receiver: z.string({ message: 'receiver is required' }).min(1),
  type: z.enum(['video', 'audio', 'image', 'file', 'text'], { required_error: 'type is required' }),
  content: z.string({ message: 'content is required' }).min(1),
  time: z.number({ message: 'time is required' }),
  read: z.boolean({ message: 'read is a boolean' }).optional(),
  payload: z
    .object({
      video: z
        .object({
          cover: z.string().min(1).optional()
        })
        .optional(),
      audio: z
        .object({
          pic: z.string().optional(),
          title: z.string().optional(),
          artist: z.string().optional()
        })
        .optional(),
      image: z
        .object({
          thumbnail: z.string().optional()
        })
        .optional()
    })
    .optional()
})

export const aiChatSchema = z.object({
  user: z.string({ message: 'user id is required' }).min(1),
  prompt: z.string({ message: 'prompt is required' }).min(1)
})
