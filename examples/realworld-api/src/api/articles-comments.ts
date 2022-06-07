import { authorization, contentTypeApplicationJson } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkMultipleCommentsResponse } from '../schemas/multiple-comments-response.js'
import { checkSingleCommentResponse } from '../schemas/single-comment-response.js'
import { fetchmap, ok, unauthorizedError, url } from '../util.js'

type GetArticleCommentsParams = {
  readonly slug: string
}

export const getArticleComments = ({ slug }: GetArticleCommentsParams) =>
  fetchmap(
    {
      ok: { json: checkMultipleCommentsResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/${slug}/comments`)
  )

type CreateArticleCommentsParams = {
  readonly authorizationToken: string
  readonly slug: string
  readonly body: string
}

export const createArticleComment = ({
  authorizationToken,
  slug,
  ...comment
}: CreateArticleCommentsParams) =>
  fetchmap(
    {
      ok: { json: checkSingleCommentResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/${slug}/comments`),
    {
      method: 'POST',
      body: JSON.stringify({ comment }),
      headers: {
        ...contentTypeApplicationJson,
        ...authorization(authorizationToken)
      }
    }
  )

type DeleteArticleCommentParams = {
  readonly authorizationToken: string
  readonly slug: string
  readonly id: number
}

export const deleteArticleComment = ({
  authorizationToken,
  slug,
  id
}: DeleteArticleCommentParams) =>
  fetchmap(
    {
      ok: { noBody: ok },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/${slug}/comments/${id}`),
    {
      method: 'DELETE',
      headers: authorization(authorizationToken)
    }
  )
