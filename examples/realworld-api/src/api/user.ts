import { authorization, contentTypeApplicationJson } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkUserResponse } from '../schemas/user-response.js'
import { fetchmap, unauthorizedError, url } from '../util.js'

type Authorized = {
  readonly authorizationToken: string
}

const endpoint = url('user')

export const getCurrentUser = ({ authorizationToken }: Authorized) =>
  fetchmap(
    {
      ok: { json: checkUserResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    endpoint,
    { headers: authorization(authorizationToken) }
  )

type UpdateUserParams = Authorized & {
  readonly email?: string
  readonly token?: string
  readonly username?: string
  readonly bio?: string
  readonly image?: string
}

export const updateCurrentUser = ({ authorizationToken, ...user }: UpdateUserParams) =>
  fetchmap(
    {
      ok: { json: checkUserResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify({ user }),
      headers: {
        ...authorization(authorizationToken),
        ...contentTypeApplicationJson
      }
    }
  )
