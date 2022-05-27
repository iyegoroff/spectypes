import { array, boolean, limit, number, string, struct } from 'spectypes'
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
        bio: string,
        following: boolean,
        image: string,
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
