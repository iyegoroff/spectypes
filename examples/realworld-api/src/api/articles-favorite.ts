import { authorization } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkSingleArticleResponse } from '../schemas/single-articles-response.js'
import { fetchmap, unauthorizedError, url } from '../util.js'

type ArticleFavoriteParams = {
  readonly authorizationToken: string
  readonly slug: string
}

const createArticleFavoriteRequest =
  (mode: 'favorite' | 'unfavorite') =>
  ({ authorizationToken, slug }: ArticleFavoriteParams) =>
    fetchmap(
      {
        ok: { json: checkSingleArticleResponse },
        notOk: { json: checkGenericError },
        401: { noBody: unauthorizedError }
      },
      url(`articles/${slug}/favorite`),
      {
        method: mode === 'favorite' ? 'POST' : 'DELETE',
        headers: authorization(authorizationToken)
      }
    )

export const createArticleFavorite = createArticleFavoriteRequest('favorite')

export const deleteArticleFavorite = createArticleFavoriteRequest('unfavorite')
