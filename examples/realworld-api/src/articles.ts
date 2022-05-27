import { array, boolean, limit, nullish, number, string, struct, union } from 'spectypes'
import { checkGenericError, fetchmap, isDateFormat, query, unauthorizedError, url } from './util.js'

type ArticlesParams = {
  readonly tag?: string
  readonly author?: string
  readonly favorited?: string
  readonly limit?: number
  readonly offset?: number
}

const checkMultipleArticlesResponse = struct({
  articlesCount: number,
  articles: array(
    struct({
      author: struct({
        bio: union(string, nullish),
        following: boolean,
        image: union(string, nullish),
        username: string
      }),
      body: string,
      createdAt: limit(string, isDateFormat),
      description: string,
      favorited: boolean,
      favoritesCount: number,
      slug: string,
      tagList: array(string),
      title: string,
      updatedAt: limit(string, isDateFormat)
    })
  )
})

export const getArticles = (params: ArticlesParams) =>
  fetchmap(
    {
      ok: { json: checkMultipleArticlesResponse },
      notOk: { json: checkGenericError },
      401: { noBody: unauthorizedError }
    },
    url(`articles?${query(params)}`)
  )
