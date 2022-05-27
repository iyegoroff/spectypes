import nodeFetch from 'node-fetch'
import { Dict } from 'ts-micro-dict'
import { Result } from 'ts-railway'
import { createFetchmap } from 'fetchmap'
import { array, literal, string, struct, transformer, union } from 'spectypes'
import { inspect } from 'util'
import { pipe } from 'pipe-ts'

export const fetchmap = createFetchmap(nodeFetch)

export const url = (path: string) => `https://api.realworld.io/api/${path}`

export const query = pipe(
  Dict.filter(Boolean),
  Dict.map(String),
  (params) => new URLSearchParams(params),
  String
)

const unauthorized = 'unauthorized' as const

export const unauthorizedError = () => Result.success(unauthorized)

export const unknownError = () => Result.success('unknown' as const)

export const checkGenericError = struct({ errors: struct({ body: array(string) }) })

export const checkError = union(literal(unauthorized), transformer(checkGenericError))

// eslint-disable-next-line no-null/no-null
export const deepInspect = (value: unknown) => inspect(value, false, null)

export const assert = (error: unknown) => {
  throw new Error(`Program is invalid: ${deepInspect(error)}`)
}
export const isDateFormat = (maybeDate: string) => !isNaN(Date.parse(maybeDate))
