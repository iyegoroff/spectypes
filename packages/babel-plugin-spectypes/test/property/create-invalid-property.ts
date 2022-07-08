/* eslint-disable no-null/no-null */
import invariant from 'ts-tiny-invariant'
import stringHash from 'string-hash'
import fc from 'fast-check'
import { unreachableCase } from 'ts-assert-unreachable'
import { assertRecord, isRecord } from 'ts-is-record'
import { assertDefined, isDefined } from 'ts-is-defined'
import { Result } from 'ts-railway'
import { Dict } from 'ts-micro-dict'
import { escapeRegexp } from '../../../spectypes/src'
import { isTemplateItem, OptionalSpec, Spec, TemplateItemArray } from '../../src/spec'
import {
  allSpecs,
  Arb,
  chance,
  generateKeys,
  intersect,
  randomSpec,
  skip,
  Specs,
  terminalSpecs
} from './common'
import { weights } from './weights'
import { templateFloatConfig } from '../common'

const numberTest =
  '(?:(?:[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?)|(?:0[Bb][01]+)|(?:0[Oo][0-7]+)|(?:0[Xx][0-9A-Fa-f]+))'
const stringTest = '.*'
const booleanTest = '(?:true|false)'
const bannedKeys = Object.getOwnPropertyNames(Object.prototype)

const unionCaseMarker = '1501dbd7-b866-465f-8abd-e7c6b111632f'

type ArbValue<A extends fc.Arbitrary<unknown>> = A extends fc.Arbitrary<infer Val>
  ? Readonly<Val>
  : never
type Error = ReturnType<typeof err>
type Elem = ReturnType<typeof elem>
type NestedError = ReadonlyArray<Error | NestedError>
type Path = ReadonlyArray<
  number | string | typeof valueMarker | typeof keyMarker | typeof elemMarker
>
type FinalPath = ReadonlyArray<string | number>

const valueMarker = Symbol('value')
const keyMarker = Symbol('key')
const elemMarker = Symbol('elem')

const flattenErrors = (errors: NestedError): readonly Error[] =>
  errors.flatMap((e) => (e instanceof fc.Arbitrary ? e : flattenErrors(e)))

const err = (
  error: fc.Arbitrary<unknown>,
  issue:
    | string
    | ((
        value: unknown
      ) => ReadonlyArray<
        (path: FinalPath) => { readonly issue: string; readonly path: FinalPath }
      >),
  path: Path
) =>
  fc.record({
    error,
    issue: fc.constant(
      typeof issue === 'string' ? () => [(p: FinalPath) => ({ issue, path: p })] : issue
    ),
    path: fc.constant(path)
  })

const elem = (path: Path, val: fc.Arbitrary<unknown>) => fc.record({ val, path: fc.constant(path) })

export const createInvalidProperty = (depth: number) => {
  const tuple = (specs: Specs, path: Path, count: number) => {
    const availableSpecs = skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional'])
    const size = chance.integer({ min: 1, max: 10 })
    const subSpecs: Array<Exclude<Spec, OptionalSpec>> = []
    const subArbs: Arb[] = []
    const subErrors: NestedError[] = []
    const subElems: Elem[] = []

    for (let i = 0; i < size; i++) {
      const [spec, arb, errors, elems] = step(availableSpecs, [...path, i], count - 1)
      if (spec[0] !== 'optional') {
        subSpecs.push(spec)
        subArbs.push(arb)
        subErrors.push(errors)
        subElems.push(...elems)
      } else {
        invariant(false, `'optional' is forbidden inside 'tuple'`)
      }
    }

    return [
      ['tuple', subSpecs],
      fc.tuple(...subArbs),
      [
        err(
          fc.array(fc.anything()).filter((x) => x.length !== size),
          `length is not ${size}`,
          path
        ),
        err(
          fc.anything().filter((x) => !Array.isArray(x)),
          `not an array`,
          path
        ),
        subErrors
      ],
      subElems
    ] as const
  }

  const objectRecord = (specs: Specs, path: Path, count: number, filtered: boolean) => {
    const [
      [, objectSpec],
      objectArb,
      [, ...objectErrors] /* skip 'excess keys' error */,
      objectElems
    ] = object(specs, path, count)
    const [[, ...recordSpec], recordArb, recordErrors, recordElems] = record(
      specs,
      path,
      count,
      filtered
    )

    return [
      ['objectRecord', objectSpec, ...recordSpec],
      fc.tuple(objectArb, recordArb).map(([obj, rec]) => ({ ...rec, ...obj })),
      [
        ...objectErrors,
        ...recordErrors.map((error) =>
          error instanceof fc.Arbitrary
            ? error.chain((e) => {
                const x = e.error

                return isRecord(x)
                  ? objectArb.map((o) => ({ ...e, error: { ...x, ...o } }))
                  : fc.constant(e)
              })
            : error
        )
      ],
      [...objectElems, ...recordElems]
    ] as const
  }

  const tupleArray = (specs: Specs, path: Path, count: number, filtered: boolean) => {
    const [[, tupleSpec], tupleArb, tupleErrors, tupleElems] = tuple(specs, path, count)
    const [[, ...arraySpec], arrayArb, arrayErrors, arrayElems] = array(
      specs,
      path,
      count,
      filtered
    )

    return [
      ['tupleArray', tupleSpec, ...arraySpec],
      fc.tuple(tupleArb, arrayArb).map(([tup, arr]) => [...tup, ...arr]),
      [
        ...tupleErrors.map((es) =>
          es instanceof fc.Arbitrary
            ? es
                .filter((e) => !Array.isArray(e.error) || e.error.length < tupleSpec.length)
                .map((e) => ({
                  ...e,
                  issue: (v: unknown) =>
                    e.issue(v).map((fn) => (p: FinalPath) => {
                      const prev = fn(p)
                      return {
                        issue: prev.issue.replace('length is not', 'length is less than'),
                        path: prev.path
                      }
                    })
                }))
            : es
        ),
        ...arrayErrors
      ],
      [...tupleElems, ...arrayElems]
    ] as const
  }

  const array = (specs: Specs, path: Path, count: number, filtered: boolean) => {
    const filter = (x: unknown) => String(JSON.stringify(x)).length > 25
    const elemPath = [...path, elemMarker] as const
    const [spec, arb, errors, elems] = step(
      skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional']),
      elemPath,
      count - 1
    )

    return [
      filtered
        ? (['array', spec, ['function', '(x) => String(JSON.stringify(x)).length > 25']] as const)
        : (['array', spec] as const),
      filtered ? fc.array(arb) : fc.array(arb).map((arr) => arr.filter(filter)),
      [
        err(
          fc.anything().filter((x) => !Array.isArray(x)),
          `not an array`,
          path
        ),
        errors
      ],
      [...elems, elem(elemPath, arb)]
    ] as const
  }

  const record = (specs: Specs, path: Path, count: number, filtered: boolean) => {
    const keyFilter = (x: unknown) => String(x).length > 3
    const valueFilter = (x: unknown) => String(JSON.stringify(x)).length > 25
    const keyPath = [...path, keyMarker] as const
    const [keySpec, keyArb, keyErrors] = step(
      intersect(specs, ['template', 'limit-string', 'string-literal', 'literal-union']),
      keyPath,
      count - 1
    )

    const valuePath = [...path, valueMarker] as const
    const [valueSpec, valueArb, valueErrors, valueElems] = step(
      skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional']),
      valuePath,
      count - 1
    )

    const arb = fc.dictionary(
      keyArb.map((x) => {
        invariant(typeof x === 'string', 'key should be a string')

        return String(x)
      }),
      valueArb
    )

    return [
      filtered
        ? ([
            'record',
            keySpec,
            valueSpec,
            ['function', '(x) => String(x).length > 3'],
            ['function', '(x) => String(JSON.stringify(x)).length > 25']
          ] as const)
        : (['record', keySpec, valueSpec] as const),
      filtered ? arb.map(Dict.filter((item, key) => keyFilter(key) && valueFilter(item))) : arb,
      [
        err(
          fc.anything().filter((x) => !isRecord(x)),
          `not an object`,
          path
        ),
        err(
          fc
            .tuple(arb, valueArb)
            .map(([rec, valid]) =>
              chance
                .pickset(bannedKeys, chance.integer({ min: 1, max: bannedKeys.length }))
                .reduce((acc, val) => ({ ...acc, [val]: valid }), rec)
            ),
          (val) => {
            assertRecord(val, 'record is required')

            return Object.keys(val)
              .filter((x) => bannedKeys.includes(x))
              .map((x) => (p: FinalPath) => ({ issue: `includes banned '${x}' key`, path: p }))
          },
          path
        ),
        addIssuePrefix(keyErrors, 'key issue: '),
        valueErrors
      ],
      [...valueElems, elem(valuePath, valueArb), elem(keyPath, keyArb)]
    ] as const
  }

  const object = (specs: Specs, path: Path, count: number) => {
    const keys = generateKeys()
    const subSpecs: Record<string, Spec> = {}
    const subArbs: Record<string, Arb> = {}
    const subErrors: NestedError[] = []
    const subElems: Elem[] = []

    for (const key of keys) {
      const [spec, arb, errors, elems] = step(
        [...specs, 'optional', 'union', 'transforming-union', 'unknown'],
        [...path, key],
        count - 1
      )
      subSpecs[key] = spec
      subArbs[key] = arb
      subErrors.push(errors)
      subElems.push(...elems)
    }

    let excessKeys: string[] = []
    while (excessKeys.length === 0) {
      excessKeys = generateKeys().filter((x) => !keys.includes(x))
    }

    return [
      ['object', subSpecs],
      fc.record(subArbs),
      [
        err(
          fc.record(excessKeys.reduce((acc, val) => ({ ...acc, [val]: fc.anything() }), subArbs)),
          (val) => {
            assertRecord(val, 'record is required')

            return Object.keys(val)
              .filter((k) => excessKeys.includes(k))
              .map((k) => (p) => ({ issue: `excess key - ${k}`, path: p }))
          },
          path
        ),
        err(
          fc.anything().filter((x) => !isRecord(x)),
          `not an object`,
          path
        ),
        subErrors
      ],
      subElems
    ] as const
  }

  const addIssuePrefix = (errors: NestedError, issuePrefix: string): NestedError =>
    errors.map((error) =>
      error instanceof fc.Arbitrary
        ? error.map((e) => ({
            ...e,
            issue: (val) =>
              e.issue(val).map((x) => (p) => {
                const { issue, path } = x(p)
                return { issue: `${issuePrefix}${issue}`, path }
              })
          }))
        : addIssuePrefix(error, issuePrefix)
    )

  const step = (
    specs: Specs,
    path: Path,
    count: number
  ): readonly [Spec, Arb, NestedError, readonly Elem[]] => {
    const specName = randomSpec(count === 0 ? intersect(specs, terminalSpecs) : specs, {
      ...weights,
      'template-union': 0,
      unknown: 0,
      limit: 0
    })
    const insideRecordKey = path[path.length - 1] === keyMarker

    switch (specName) {
      case 'string-literal': {
        const str = chance.string()

        return [
          ['literal', ['string', str]],
          fc.constant(str),
          [
            err(
              fc.string().filter((x) => x !== str),
              `not a '${str}' string literal`,
              path
            )
          ],
          []
        ]
      }

      case 'null-literal':
        return [
          ['literal', ['null']],
          fc.constant(null),
          [
            err(
              fc.anything().filter((x) => x !== null),
              `not a 'null' literal`,
              path
            )
          ],
          []
        ]

      case 'numeric-literal': {
        const num = chance.integer()

        return [
          ['literal', ['numeric', num]],
          fc.constant(num),
          [
            err(
              fc.anything().filter((x) => x !== num),
              `not a '${num}' number literal`,
              path
            )
          ],
          []
        ]
      }

      case 'boolean-literal': {
        const bool = chance.bool()

        return [
          ['literal', ['boolean', bool]],
          fc.constant(bool),
          [
            err(
              fc.anything().filter((x) => x !== bool),
              `not a '${String(bool)}' boolean literal`,
              path
            )
          ],
          []
        ]
      }

      case 'undefined-literal':
        return [
          ['literal', ['identifier', 'undefined']],
          fc.constant(undefined),
          [
            err(
              fc.anything().filter((x) => x !== undefined),
              `not a 'undefined' literal`,
              path
            )
          ],
          []
        ]

      case 'number':
        return [
          ['number'],
          fc.float(templateFloatConfig),
          [
            err(
              fc.anything().filter((x) => typeof x !== 'number'),
              `not a number`,
              path
            )
          ],
          []
        ]

      case 'string':
        return [
          ['string'],
          fc.string(),
          [
            err(
              fc.anything().filter((x) => typeof x !== 'string'),
              `not a string`,
              path
            )
          ],
          []
        ]

      case 'boolean':
        return [
          ['boolean'],
          fc.boolean(),
          [
            err(
              fc.anything().filter((x) => typeof x !== 'boolean'),
              `not a boolean`,
              path
            )
          ],
          []
        ]

      case 'unknown':
        return [['unknown'], fc.anything(), [], []]

      case 'filtered-record':
        return record(specs, path, count, true)

      case 'filtered-object-record':
        return objectRecord(specs, path, count, true)

      case 'filtered-array':
        return array(specs, path, count, true)

      case 'filtered-tuple-array':
        return tupleArray(specs, path, count, true)

      case 'template-union':
        return [['unknown'], fc.anything(), [], []]

      case 'nullish':
        return [
          ['nullish'],
          fc.oneof(fc.constant(undefined), fc.constant(null)),
          [
            err(
              fc.anything().filter((x) => x !== undefined && x !== null),
              `not 'null' or 'undefined'`,
              path
            )
          ],
          []
        ]

      case 'optional': {
        const [spec, arb, errors, elems] = step(
          skip([...specs, 'union', 'transforming-union'], ['optional']),
          path,
          count - 1
        )

        return [
          ['optional', spec],
          fc.option(arb, { nil: undefined }),
          errors.map((e) =>
            e instanceof fc.Arbitrary ? e.filter(({ error }) => error !== undefined) : e
          ),
          [...elems, elem(path, arb)]
        ]
      }

      case 'template': {
        const availableSpecs = skip(terminalSpecs, [
          'unknown',
          'nullish',
          'template',
          'limit-string'
        ])
        const size = chance.integer({ min: 0, max: 10 })
        const subSpecs: Array<TemplateItemArray[number]> = []
        const subArbs: Arb[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb] = step(availableSpecs, path, count - 1)
          if (isTemplateItem(spec)) {
            subSpecs.push(spec)
            subArbs.push(arb)
          }
        }

        if (subSpecs.every(([tag]) => tag === 'string')) {
          subSpecs.push(['number'])
          subArbs.push(fc.float(templateFloatConfig))
        }

        const templateTest = new RegExp(
          subSpecs.reduce(
            (acc, val) =>
              `${acc}${
                val[0] === 'boolean'
                  ? booleanTest
                  : val[0] === 'number'
                  ? numberTest
                  : val[0] === 'string'
                  ? stringTest
                  : val[1][0] === 'string'
                  ? escapeRegexp(val[1][1])
                  : val[1][0] === 'null'
                  ? 'null'
                  : String(val[1][1])
              }`,
            '^'
          ) + '$'
        )

        return [
          ['template', subSpecs],
          fc
            .tuple(...subArbs)
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          [
            ...(insideRecordKey
              ? []
              : [
                  err(
                    fc.anything().filter((x) => typeof x !== 'string'),
                    `not a string`,
                    path
                  )
                ]),
            err(
              fc.string().filter((x) => !templateTest.test(x)),
              `template literal mismatch`,
              path
            )
          ],
          []
        ]
      }

      case 'tuple':
        return tuple(specs, path, count)

      case 'union':
      case 'transforming-union': {
        const size = chance.integer({ min: 1, max: 10 })
        const subSpecs: Spec[] = []
        const subArbs: Arb[] = []
        const subErrors: NestedError[] = []
        const subElems: Elem[] = []

        for (let i = 0; i < size; i++) {
          const caseKey = `${unionCaseMarker}:${i}`
          const casePath = [...path, caseKey] as const
          const [spec, arb, errors, elems] = step(specs, casePath, count - 1)
          subSpecs.push(['object', { [caseKey]: spec }])
          subArbs.push(fc.record({ [caseKey]: arb }))
          subErrors.push(addIssuePrefix(errors, `union case #${i} mismatch: `))
          subElems.push(...elems)
          subElems.push(elem(casePath, arb))
        }

        return [['union', subSpecs], fc.oneof(...subArbs), subErrors, subElems]
      }

      case 'literal-union': {
        const size = chance.integer({ min: 1, max: 10 })
        const subSpecs: Spec[] = []
        const subArbs: Arb[] = []
        const subErrors: NestedError[] = []
        const subElems: Elem[] = []
        const marker = '_'

        let index = 0
        while (index < size) {
          const [spec, arb, errors, elems] = step(['string-literal'] as const, path, count - 1)
          if (spec[0] === 'literal' && !`${String(spec[1][1])}`.includes(marker)) {
            subSpecs.push(spec)
            subArbs.push(arb)
            subErrors.push(
              addIssuePrefix(errors, `union case #${index} mismatch: `).map((e) =>
                e instanceof fc.Arbitrary
                  ? e.map((x) =>
                      typeof x.error === 'string' ? { ...x, error: `${marker}${x.error}` } : x
                    )
                  : e
              )
            )
            subElems.push(...elems)
            subElems.push(elem(path, arb))

            index += 1
          }
        }

        return [['union', subSpecs], fc.oneof(...subArbs), subErrors, subElems]
      }

      case 'array':
        return array(specs, path, count, false)

      case 'object':
        return object(specs, path, count)

      case 'struct': {
        const keys = generateKeys()
        const extraKeys = generateKeys(3)
        const subSpecs: Record<string, Spec> = {}
        const subArbs: Record<string, Arb> = {}
        const subErrors: NestedError[] = []
        const subElems: Elem[] = []

        for (const key of extraKeys) {
          subArbs[key] = step(specs, [...path, key], count - 1)[1]
        }

        for (const key of keys) {
          const [spec, arb, errors, elems] = step(
            [...specs, 'optional', 'union', 'transforming-union', 'unknown'],
            [...path, key],
            count - 1
          )
          subSpecs[key] = spec
          subArbs[key] = arb
          subErrors.push(errors)
          subElems.push(...elems)
        }

        return [
          ['struct', subSpecs],
          fc.record(subArbs),
          [
            err(
              fc.anything().filter((x) => !isRecord(x)),
              `not an object`,
              path
            ),
            subErrors
          ],
          subElems
        ]
      }

      case 'limit': {
        const [spec, arb, errors, elems] = step(skip(specs, ['optional']), path, count - 1)
        // eslint-disable-next-line no-self-compare
        const limit = (x: unknown) => x === x || (typeof x === 'number' && isNaN(x))

        return [
          ['limit', spec, ['function', "(x) => x === x || (typeof x === 'number' && isNaN(x))"]],
          arb.filter(limit),
          errors,
          elems
        ]
      }

      case 'limit-number': {
        const limit = (x: number) => x % 2 === 0
        const [, , errors, elems] = step(['number'], path, count)

        return [
          ['limit', ['number'], ['identifier', 'isEven']],
          fc.nat().filter(limit),
          [
            err(
              fc.nat().filter((x) => !limit(x)),
              'does not fit the limit',
              path
            ),
            ...errors
          ],
          elems
        ]
      }

      case 'limit-string': {
        const limit = (x: string) => Boolean(x.length % 2)
        const [, , errors, elems] = step(['string'], path, count)

        return [
          ['limit', ['string'], ['function', '(x) => Boolean(x.length % 2)']],
          fc.string().filter(limit),
          [
            err(
              fc.string().filter((x) => !limit(x)),
              'does not fit the limit',
              path
            ).map((e) => {
              // console.log(e.error)
              return e
            }),
            ...(insideRecordKey ? [] : errors)
          ],
          elems
        ]
      }

      case 'map-unknown-string': {
        const [spec, arb, errors, elems] = step(skip(specs, ['optional']), path, count - 1)

        return [['map', spec, ['identifier', 'hash']], arb, errors, elems]
      }

      case 'map-string-number': {
        const [spec, arb, errors, elems] = step(['string'], path, count)

        return [['map', spec, ['function', String(stringHash)]], arb, errors, elems]
      }

      case 'map-string-string': {
        const [spec, arb, errors, elems] = step(['string'], path, count)

        return [['map', spec, ['function', '(x) => JSON.stringify(x)']], arb, errors, elems]
      }

      case 'record':
        return record(specs, path, count, false)

      case 'writable': {
        const [spec, arb, errors, elems] = step(specs, path, count - 1)

        return [['writable', spec], arb, errors, elems]
      }

      case 'tuple-array':
        return tupleArray(specs, path, count, false)

      case 'object-record':
        return objectRecord(specs, path, count, false)
    }
  }

  const [spec, arb, allErrors, allElems] = step(skip(allSpecs, ['template-union']), [], depth)

  return [spec, arb, fc.oneof(...flattenErrors(allErrors)), fc.tuple(...allElems)] as const
}

const findElem = (elems: ReadonlyArray<ArbValue<Elem>>, path: Path) => {
  const idx = elems.findIndex(
    (x) => x.path.length === path.length && x.path.every((v, i) => path[i] === v)
  )

  return idx >= 0 ? Result.success(elems[idx]?.val) : Result.failure(undefined)
}

export const injectError = (
  value: unknown,
  { error, path }: ArbValue<Error>,
  elems: ReadonlyArray<ArbValue<Elem>>
) => {
  const actualPath: Array<string | number> = []

  const isArray = (val: unknown, lastIdx: number): val is readonly unknown[] =>
    Array.isArray(val) && (val as readonly unknown[]).length > lastIdx

  const isKey = (key: unknown): key is number | string =>
    typeof key === 'string' || typeof key === 'number'

  const pathToString = (p: Path) => String(p.map(String))

  const step = (val: unknown, idx: number): unknown => {
    const next = path[idx]
    const prevPath = path.slice(0, idx)
    const prevElem = findElem(elems, prevPath)
    const parent = prevElem.tag === 'success' ? prevElem.success : undefined

    if (!isDefined(next)) {
      return error
    }

    if (typeof next === 'number') {
      actualPath.push(next)

      const item = isArray(val, next) ? val : isArray(parent, next) ? parent : undefined

      assertDefined(item, `elem at path '${pathToString(prevPath)}' is not an array`)

      return item.map((v, i) => (i === next ? step(v, idx + 1) : v))
    }

    if (typeof next === 'string') {
      actualPath.push(next)

      const item = isRecord(val) ? val : isRecord(parent) ? parent : undefined

      assertDefined(item, `elem at path '${pathToString(prevPath)}' is not a record`)

      return Object.assign(item, { [next]: step(item[next], idx + 1) })
    }

    if (next === elemMarker) {
      const arr = Array.isArray(val)
        ? (val as readonly unknown[])
        : Array.isArray(parent)
        ? (parent as readonly unknown[])
        : undefined

      const elemPath = path.slice(0, idx + 1)
      const item = findElem(elems, elemPath)

      if (item.tag === 'failure') {
        return invariant(false, `valid value for '${pathToString(elemPath)}' path not found`)
      }

      assertDefined(arr, `elem at path '${pathToString(prevPath)}' is not an array`)

      actualPath.push(arr.length)

      return [...arr, step(item.success, idx + 1)]
    }

    if (next === keyMarker || next === valueMarker) {
      const rec = isRecord(val) ? val : isRecord(parent) ? parent : undefined
      const keyPath = [...prevPath, keyMarker] as const
      const itemPath = [...prevPath, valueMarker] as const
      const key = findElem(elems, keyPath)
      const item = findElem(elems, itemPath)

      if (key.tag === 'failure') {
        return invariant(false, `valid value for '${pathToString(keyPath)}' path not found`)
      }

      if (item.tag === 'failure') {
        return invariant(false, `valid value for '${pathToString(itemPath)}' path not found`)
      }

      assertDefined(rec, `elem at path '${pathToString(prevPath)}' is not a record`)

      if (next === keyMarker) {
        const keyError = step(key.success, idx + 1)

        actualPath.push(String(keyError))

        return isKey(keyError)
          ? { ...rec, [keyError]: item.success }
          : invariant(false, `key is not a string`)
      }

      const validKey = key.success

      actualPath.push(String(validKey))

      return isKey(validKey)
        ? { ...rec, [validKey]: step(item.success, idx + 1) }
        : invariant(false, `key is not a string`)
    }

    return unreachableCase(next, `'next' is invalid`)
  }

  return [step(value, 0), actualPath] as const
}
