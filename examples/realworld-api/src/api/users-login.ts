import { contentTypeApplicationJson } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkUserResponse } from '../schemas/user-response.js'
import { fetchmap, unauthorizedError, url } from '../util.js'

type LoginParams = {
  readonly password: string
  readonly email: string
}

export const login = (user: LoginParams) =>
  fetchmap(
    {
      ok: { json: checkUserResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url('users/login'),
    {
      method: 'POST',
      body: JSON.stringify({ user }),
      headers: contentTypeApplicationJson
    }
  )
