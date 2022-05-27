// import { inspect } from 'util'
// import { Result } from 'ts-railway'
import process from 'process'
import inquirer from 'inquirer'
import { getArticles } from './articles.js'
import { number, optional, string, struct } from 'spectypes'
import { pipe } from 'pipe-ts'
import { AsyncResult, Result } from 'ts-railway'
import { assert, deepInspect } from './util.js'
import { createUser } from './users.js'
// import { getArticles } from './articles.js'
// import { createUser } from './users.js'

const { prompt } = inquirer

const config = {
  token: ''
}

// eslint-disable-next-line no-null/no-null
// const depth = null

// const log = (name: string) =>
//   Result.match({
//     success: (value) => {
//       console.log(`${name} success:`, inspect(value, false, depth))
//     },
//     failure: (error) => {
//       console.log(`${name} failure:`, inspect(error, false, depth))
//     }
//   })

const checkArticleParams = struct({
  tag: optional(string),
  author: optional(string),
  favorited: optional(string),
  limit: optional(number),
  offset: optional(number)
})

const checkUserParams = struct({
  email: string,
  password: string,
  username: string
})

const checkedRequest = <CheckSuccess, CheckFailure, RequestSuccess, RequestFailure>(
  check: (params: unknown) => Result<CheckSuccess, CheckFailure>,
  request: (params: CheckSuccess) => AsyncResult<RequestSuccess, RequestFailure>
) => pipe(check, Result.mapError(assert), AsyncResult.flatMap(request))

type Method = 'POST' | 'PUT' | 'GET' | 'DELETE'

type RequestParams = {
  readonly request: (params: unknown) => AsyncResult
  readonly params: ReadonlyArray<{
    readonly name: string
    readonly type: string
    readonly def?: string | number
  }>
}

const availableMethods = {
  '/users': new Map<Method, RequestParams>([
    [
      'POST',
      {
        request: pipe(
          checkedRequest(checkUserParams, createUser),
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
    ]
  ]),
  '/articles': new Map<Method, RequestParams>([
    [
      'GET',
      {
        request: checkedRequest(checkArticleParams, getArticles),
        params: [
          { name: 'tag', type: 'string' },
          { name: 'author', type: 'string' },
          { name: 'favorited', type: 'string' },
          { name: 'limit', type: 'number', def: 3 },
          { name: 'offset', type: 'number', def: 0 }
        ]
      }
    ]
  ])
} as const

const main = async () => {
  try {
    do {
      const { path } = await prompt<{ path: keyof typeof availableMethods }>({
        name: 'path',
        type: 'list',
        message: 'Choose request path',
        choices: Object.keys(availableMethods).sort()
      })

      const requests = availableMethods[path]

      const { method } = await prompt<{ method: Method }>({
        name: 'method',
        type: 'list',
        message: 'Choose HTTP method',
        choices: [...requests.keys()].sort()
      })

      const request = requests.get(method)

      const params = [] as Array<Record<string, unknown>>
      for (const { name, type, def } of request?.params ?? []) {
        params.push(
          await prompt({
            name,
            type: type === 'number' ? 'number' : 'input',
            message: `Enter '${String(name)}' param`,
            default: def
          })
        )
      }

      const merged = params.reduce((acc, val) => ({ ...acc, ...val }))

      if (request?.request !== undefined) {
        console.log(deepInspect(await request.request(merged)))
      }
    } while (
      (
        await prompt<{ repeat: true }>({
          name: 'repeat',
          type: 'confirm',
          message: 'Once again?'
        })
      ).repeat
    )
  } catch (e) {
    console.log(e)
    process.exitCode = 1
  }
}

//   .then(({ url }) => {
//     console.log(answer)
//   })
// try {
//   await createUser({ email: 'test@test.com', password: 'test', username: 'test' }).then(
//     log('createUser')
//   )
//   // await getArticles({}).then(log('getArticles'))
// } catch (e) {
//   console.log('should never happen', e)
// }

await main()
