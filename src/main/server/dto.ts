import joi, { type Root, type Schema, type ValidationOptions } from 'joi'
import type { Handler } from 'express'

const schemaKeys = ['params', 'query', 'body']

type Schemas = Partial<Record<'query' | 'body' | 'params', Record<string, Schema>>>

export const joiValidator = (
  schemas: Schemas,
  options: ValidationOptions & { strict?: boolean } = { strict: false }
): Handler => {
  const validateOptions = { allowUnknown: true, stripUnknown: true }
  if (!options.strict) {
    const { strict, ...rest } = options
    Object.assign(validateOptions, rest)
  }

  return (req, res, next) => {
    schemaKeys.forEach(key => {
      if (!schemas[key]) return

      const schema = joi.object(schemas[key])
      const { error, value } = schema.validate(req[key], validateOptions)

      if (error) {
        res.status(400).send(error.details[0].message)
        throw error
      } else {
        req[key] = value
      }
    })

    next()
  }
}

function createDtoValidator(schemaFn: (joi: Root) => Schemas, options?: ValidationOptions) {
  return joiValidator(schemaFn(joi), options)
}

export const createUserDto = createDtoValidator(joi => ({
  body: {
    username: joi.string().required()
  }
}))

export const updateUserDto = createDtoValidator(joi => ({
  body: {
    username: joi.string().optional()
  },
  params: {
    id: joi.string().required()
  }
}))
