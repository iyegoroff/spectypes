import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkProfileResponse } from '../schemas/profile-response.js'
import { fetchmap, unauthorizedError, url } from '../util.js'

type GetProfileParams = {
  readonly username: string
}

export const getProfile = ({ username }: GetProfileParams) =>
  fetchmap(
    {
      ok: { json: checkProfileResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`profiles/${username}`)
  )
