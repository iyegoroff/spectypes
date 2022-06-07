import { authorization, contentTypeApplicationJson } from '../headers.js'
import { checkGenericError } from '../schemas/generic-error-model.js'
import { checkMultipleArticlesResponse } from '../schemas/multiple-articles-response.js'
import { checkSingleArticleResponse } from '../schemas/single-articles-response.js'
import { fetchmap, ok, query, unauthorizedError, url } from '../util.js'

type GetArticlesParams = {
  readonly tag?: string
  readonly author?: string
  readonly favorited?: string
  readonly limit?: number
  readonly offset?: number
}

export const getArticles = (params: GetArticlesParams) =>
  fetchmap(
    {
      ok: { json: checkMultipleArticlesResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles?${query(params)}`)
  )

type GetArticleParams = {
  readonly slug: string
}

export const getArticle = ({ slug }: GetArticleParams) =>
  fetchmap(
    {
      ok: { json: checkSingleArticleResponse },
      notOk: { json: checkGenericError }
    },
    url(`articles/${slug}`)
  )

type UpdateArticleParams = {
  readonly authorizationToken: string
  readonly slug: string
  readonly title?: string
  readonly description?: string
  readonly body?: string
}

export const updateArticle = ({ authorizationToken, slug, ...article }: UpdateArticleParams) =>
  fetchmap(
    {
      ok: { json: checkSingleArticleResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/${slug}`),
    {
      method: 'PUT',
      body: JSON.stringify({ article }),
      headers: {
        ...contentTypeApplicationJson,
        ...authorization(authorizationToken)
      }
    }
  )

type DeleteArticleParams = {
  readonly authorizationToken: string
  readonly slug: string
}

export const deleteArticle = ({ authorizationToken, slug }: DeleteArticleParams) =>
  fetchmap(
    {
      ok: { noBody: ok },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles/${slug}`),
    {
      method: 'DELETE',
      headers: authorization(authorizationToken)
    }
  )

type CreateArticleParams = {
  readonly authorizationToken: string
  readonly body: string
  readonly description: string
  readonly title: string
  readonly tagList?: readonly string[]
}

export const createArticle = ({ authorizationToken, ...article }: CreateArticleParams) =>
  fetchmap(
    {
      ok: { json: checkSingleArticleResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles`),
    {
      method: 'POST',
      body: JSON.stringify({ article }),
      headers: {
        ...contentTypeApplicationJson,
        ...authorization(authorizationToken)
      }
    }
  )
