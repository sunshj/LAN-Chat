import { type ZodError, type ZodObject, z } from 'zod'
import type { Handler } from 'express'

export function extractZodError(error: ZodError) {
  return error.errors.map(e => e.message).join(', ')
}

const schemaKeys = ['params', 'query', 'body'] as const
type SchemaKeys = (typeof schemaKeys)[number]

type Schemas = Partial<Record<SchemaKeys, ZodObject<any>>>

function createDtoMiddleware(getSchema: Schemas | ((zod: typeof z) => Schemas)): Handler {
  const schema = typeof getSchema === 'function' ? getSchema(z) : getSchema
  return (req, res, next) => {
    schemaKeys.forEach(key => {
      if (schema[key]) {
        const { data, error } = schema[key]!.safeParse(req[key])
        if (error) {
          res.status(400).send({ statusCode: 400, message: extractZodError(error) })
          throw error
        } else {
          req[key] = data
        }
      }
    })

    next()
  }
}

const updateUserSchema = {
  params: z.object({
    id: z.string({ message: 'id is required' })
  }),
  body: z.object({
    username: z.string({ message: 'username is required' }).min(1)
  })
}

const createUserSchema = {
  body: z.object({
    username: z.string({ message: 'username is required' }).min(1)
  })
}

export const updateUserDto = createDtoMiddleware(updateUserSchema)

export const createUserDto = createDtoMiddleware(createUserSchema)
