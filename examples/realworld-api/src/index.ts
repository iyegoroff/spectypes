/* eslint-disable node/handle-callback-err */
import nodeFetch from 'node-fetch'
import { inspect } from 'util'
import { Dict } from 'ts-micro-dict'
import { AsyncResult, Result } from 'ts-railway'
import { pipe, pipeWith } from 'pipe-ts'
import { createFetchmap } from 'fetchmap'
import { number, struct } from 'spectypes'

const fetchmap = createFetchmap(nodeFetch)

const url = (path: string) => `https://api.realworld.io/api/${path}`

const query = (params: Record<string, unknown>) =>
  new URLSearchParams(Dict.map(String, params)).toString()

const wrapFailure = <S, F, W>(fn: (_: unknown) => Result<S, F>, wrap: (failure: F) => W) =>
  pipe(fn, Result.mapError(wrap))

const validationFailure = <T>(validationError: T) => ({ validationError } as const)

type ArticlesQueryParams = {
  readonly tag?: string
  readonly author?: string
  readonly favorited?: string
  readonly limit?: number
  readonly offset?: number
}

const checkArticles = struct({ articlesCount: number })

const getArticles = (params: ArticlesQueryParams) =>
  pipeWith(
    fetchmap({ ok: 'json' }, url(`articles?${query(params)}`)),
    AsyncResult.flatMap(wrapFailure(checkArticles, validationFailure))
  )

const articles = getArticles({})

articles
  .then(
    Result.match({
      success: (arts) => {
        console.log('getArticles success:', inspect(arts, true))
      },
      failure: (err) => {
        console.log('getArticles failure:', inspect(err, true))
      }
    })
  )
  .catch((x: unknown) => console.log('should never happen', x))
