import { authorization } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkMultipleArticlesResponse } from '../schemas/multiple-articles-response.js'
import { fetchmap, query, unauthorizedError, url } from '../util.js'

type GetArticlesFeedParams = {
  readonly authorizationToken: string
  readonly limit?: number
  readonly offset?: number
}

export const getArticlesFeed = ({ authorizationToken, ...params }: GetArticlesFeedParams) =>
  fetchmap(
    {
      ok: { json: checkMultipleArticlesResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/feed?${query({ ...params })}`),
    { headers: authorization(authorizationToken) }
  )
