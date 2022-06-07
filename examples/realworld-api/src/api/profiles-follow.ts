import { authorization } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkProfileResponse } from '../schemas/profile-response.js'
import { fetchmap, unauthorizedError, url } from '../util.js'

type FollowUserParams = {
  readonly authorizationToken: string
  readonly username: string
}

const createFollowRequest =
  (mode: 'follow' | 'unfollow') =>
  ({ username, authorizationToken }: FollowUserParams) =>
    fetchmap(
      {
        ok: { json: checkProfileResponse },
        notOk: { json: checkGenericError },
        401: { noBody: unauthorizedError }
      },
      url(`profiles/${username}/follow`),
      {
        method: mode === 'follow' ? 'POST' : 'DELETE',
        headers: authorization(authorizationToken)
      }
    )

export const followUser = createFollowRequest('follow')

export const unfollowUser = createFollowRequest('unfollow')
