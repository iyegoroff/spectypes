import { contentTypeApplicationJson } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkUserResponse } from '../schemas/user-response.js'
import { fetchmap, url } from '../util.js'

type UserParams = {
  readonly password: string
  readonly email: string
  readonly username: string
}

export const createUser = (user: UserParams) =>
  fetchmap(
    {
      ok: { json: checkUserResponse },
      notOk: { json: checkGenericError }
    },
    url('users'),
    {
      method: 'POST',
      body: JSON.stringify({ user }),
      headers: contentTypeApplicationJson
    }
  )
