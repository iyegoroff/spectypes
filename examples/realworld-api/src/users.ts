import { array, nullish, optional, string, struct, union } from 'spectypes'
import { fetchmap, url } from './util.js'

type UserParams = {
  readonly password: string
  readonly email: string
  readonly username: string
}

const checkUserResponse = struct({
  user: struct({
    bio: union(string, nullish),
    email: string,
    image: union(string, nullish),
    token: string,
    username: string
  })
})

const checkUserError = struct({
  errors: struct({
    email: optional(array(string)),
    password: optional(array(string)),
    username: optional(array(string))
  })
})

export const createUser = (user: UserParams) =>
  fetchmap(
    {
      ok: { json: checkUserResponse },
      notOk: { json: checkUserError }
    },
    url('users'),
    {
      method: 'POST',
      body: JSON.stringify({ user }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
