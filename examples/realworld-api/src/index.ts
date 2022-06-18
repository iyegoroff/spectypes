import process from 'process'
import inquirer from 'inquirer'
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  updateArticle
} from './api/articles.js'
import { array, number, object, optional, string } from 'spectypes'
import { pipe, pipeWith } from 'pipe-ts'
import { AsyncResult, Result } from 'ts-railway'
import { assert, deepInspect } from './util.js'
import { createUser } from './api/users.js'
import { createSpinner } from 'nanospinner'
import { login } from './api/users-login.js'
import { Dict } from 'ts-micro-dict'
import { getCurrentUser, updateCurrentUser } from './api/user.js'
import { getProfile } from './api/profiles.js'
import { followUser, unfollowUser } from './api/profiles-follow.js'
import { getArticlesFeed } from './api/articles-feed.js'
import { getTags } from './api/tags.js'
import { createArticleFavorite, deleteArticleFavorite } from './api/articles-favorite.js'
import {
  createArticleComment,
  deleteArticleComment,
  getArticleComments
} from './api/articles-comments.js'

const { prompt } = inquirer

const config = {
  token: '',
  email: '',
  password: ''
}

const checkGetArticlesParams = object({
  tag: optional(string),
  author: optional(string),
  favorited: optional(string),
  limit: optional(number),
  offset: optional(number)
})

const checkCreateUserParams = object({
  email: string,
  password: string,
  username: string
})

const checkLoginParams = object({
  email: string,
  password: string
})

const checkToken = object({
  authorizationToken: string
})

const checkUpdateUserParams = object({
  authorizationToken: string,
  email: optional(string),
  token: optional(string),
  username: optional(string),
  bio: optional(string),
  image: optional(string)
})

const checkGetProfileParams = object({
  username: string
})

const checkFollowUserParams = object({
  authorizationToken: string,
  username: string
})

const checkGetArticlesFeedParams = object({
  authorizationToken: string,
  limit: optional(number),
  offset: optional(number)
})

const checkCreateArticleParams = object({
  authorizationToken: string,
  body: string,
  description: string,
  title: string,
  tagList: optional(array(string))
})

const checkGetArticleParams = object({
  slug: string
})

const checkUpdateArticleParams = object({
  authorizationToken: string,
  slug: string,
  title: optional(string),
  body: optional(string),
  description: optional(string)
})

const checkDeleteArticleParams = object({
  authorizationToken: string,
  slug: string
})

const checkArticleFavoriteParams = object({
  authorizationToken: string,
  slug: string
})

const checkGetArticleCommentsParams = object({
  slug: string
})

const checkCreateArticleCommentParams = object({
  authorizationToken: string,
  slug: string,
  body: string
})

const checkDeleteArticleCommentParams = object({
  authorizationToken: string,
  slug: string,
  id: number
})

const checkedRequest = <CheckSuccess, CheckFailure, RequestSuccess, RequestFailure>(
  check: (params: unknown) => Result<CheckSuccess, CheckFailure>,
  request: (params: CheckSuccess) => AsyncResult<RequestSuccess, RequestFailure>
) => pipe(check, Result.mapError(assert), AsyncResult.flatMap(request))

const authorizationToken = {
  name: 'authorizationToken',
  type: 'string',
  def: () => config.token
} as const

const availableMethods = {
  '/users': {
    POST: {
      request: pipe(
        checkedRequest(checkCreateUserParams, (params) => {
          config.email = params.email
          config.password = params.password

          return createUser(params)
        }),
        AsyncResult.map((user) => {
          config.token = user.user.token
          return user
        })
      ),
      params: [
        { name: 'email', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'username', type: 'string' }
      ]
    }
  },
  '/users/login': {
    POST: {
      request: pipe(
        checkedRequest(checkLoginParams, login),
        AsyncResult.map((user) => {
          config.token = user.user.token
          return user
        })
      ),
      params: [
        { name: 'email', type: 'string', def: () => config.email },
        { name: 'password', type: 'string', def: () => config.password }
      ]
    }
  },
  '/user': {
    GET: {
      request: checkedRequest(checkToken, getCurrentUser),
      params: [authorizationToken]
    },
    PUT: {
      request: pipe(
        checkedRequest(checkUpdateUserParams, updateCurrentUser),
        AsyncResult.map((user) => {
          config.token = user.user.token
          return user
        })
      ),
      params: [
        authorizationToken,
        { name: 'email', type: 'string' },
        { name: 'token', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'bio', type: 'string' },
        { name: 'image', type: 'string' }
      ]
    }
  },
  '/articles': {
    GET: {
      request: checkedRequest(checkGetArticlesParams, getArticles),
      params: [
        { name: 'tag', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'favorited', type: 'string' },
        { name: 'limit', type: 'number', def: 3 },
        { name: 'offset', type: 'number', def: 0 }
      ]
    },
    POST: {
      request: checkedRequest(checkCreateArticleParams, createArticle),
      params: [
        authorizationToken,
        { name: 'body', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'tagList', type: 'array' }
      ]
    }
  },
  '/articles/feed': {
    GET: {
      request: checkedRequest(checkGetArticlesFeedParams, getArticlesFeed),
      params: [
        authorizationToken,
        { name: 'limit', type: 'number', def: 20 },
        { name: 'offset', type: 'number', def: 0 }
      ]
    }
  },
  '/articles/{slug}': {
    GET: {
      request: checkedRequest(checkGetArticleParams, getArticle),
      params: [{ name: 'slug', type: 'string' }]
    },
    PUT: {
      request: checkedRequest(checkUpdateArticleParams, updateArticle),
      params: [
        authorizationToken,
        { name: 'slug', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'body', type: 'string' }
      ]
    },
    DELETE: {
      request: checkedRequest(checkDeleteArticleParams, deleteArticle),
      params: [authorizationToken, { name: 'slug', type: 'string' }]
    }
  },
  '/articles/{slug}/comments': {
    GET: {
      request: checkedRequest(checkGetArticleCommentsParams, getArticleComments),
      params: [{ name: 'slug', type: 'string' }]
    },
    POST: {
      request: checkedRequest(checkCreateArticleCommentParams, createArticleComment),
      params: [
        authorizationToken,
        { name: 'slug', type: 'string' },
        { name: 'body', type: 'string' }
      ]
    }
  },
  '/articles/{slug}/comments/{id}': {
    DELETE: {
      request: checkedRequest(checkDeleteArticleCommentParams, deleteArticleComment),
      params: [authorizationToken, { name: 'slug', type: 'string' }, { name: 'id', type: 'number' }]
    }
  },
  '/articles/{slug}/favorite': {
    POST: {
      request: checkedRequest(checkArticleFavoriteParams, createArticleFavorite),
      params: [authorizationToken, { name: 'slug', type: 'string' }]
    },
    DELETE: {
      request: checkedRequest(checkArticleFavoriteParams, deleteArticleFavorite),
      params: [authorizationToken, { name: 'slug', type: 'string' }]
    }
  },
  '/profiles/{username}': {
    GET: {
      request: checkedRequest(checkGetProfileParams, getProfile),
      params: [{ name: 'username', type: 'string' }]
    }
  },
  '/profiles/{username}/follow': {
    POST: {
      request: checkedRequest(checkFollowUserParams, followUser),
      params: [authorizationToken, { name: 'username', type: 'string' }]
    },
    DELETE: {
      request: checkedRequest(checkFollowUserParams, unfollowUser),
      params: [authorizationToken, { name: 'username', type: 'string' }]
    }
  },
  '/tags': {
    GET: {
      request: getTags,
      params: []
    }
  }
} as const

const main = async () => {
  const spinner = createSpinner()

  try {
    do {
      const { path }: { readonly path: unknown } = await prompt({
        name: 'path',
        type: 'list',
        message: 'Choose request path',
        choices: Object.keys(availableMethods).sort()
      })

      const requests = pipeWith(
        availableMethods,
        Dict.filter((_, k) => k === path),
        Dict.toArray((item) => item),
        ([x]) => (x === undefined ? Result.failure(undefined) : Result.success(x))
      )

      if (requests.tag === 'failure') {
        console.log('Program is invalid')
        process.exitCode = 1

        return
      }

      const { method }: { readonly method: unknown } = await prompt({
        name: 'method',
        type: 'list',
        message: 'Choose HTTP method',
        choices: [...Object.keys(requests.success)].sort()
      })

      const request = pipeWith(
        requests.success,
        Dict.filter((_, k) => k === method),
        Dict.toArray((item) => item),
        ([x]) => (x === undefined ? Result.failure(undefined) : Result.success(x))
      )

      if (request.tag === 'failure') {
        console.log('Program is invalid')
        process.exitCode = 1

        return
      }

      const requestDef = request.success

      const params = [] as Array<Record<string, unknown>>

      for (const { name, type, ...opts } of requestDef.params) {
        params.push(
          await prompt({
            name,
            type: type === 'number' ? 'number' : 'input',
            message: `Enter ${String(name)}`,
            suffix: type === 'array' ? ' (comma-separated list)' : undefined,
            filter:
              type === 'array'
                ? (items: unknown) =>
                    String(items)
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                : undefined,
            default: 'def' in opts ? opts.def : undefined
          })
        )
      }

      const merged = params.reduce((acc, val) => ({ ...acc, ...val }), {})

      spinner.start()
      const result = await requestDef.request(merged)
      spinner.clear()
      console.log(deepInspect(result))
      Result.match({ success: () => spinner.success(), failure: () => spinner.error() }, result)
    } while (
      (
        await prompt<{ repeat: true }>({
          name: 'repeat',
          type: 'confirm',
          message: 'Continue?'
        })
      ).repeat
    )
  } catch (e) {
    spinner.clear()
    console.log(e)
    process.exitCode = 1
  }
}

await main()
