/* eslint-disable no-null/no-null */
import invariant from 'ts-tiny-invariant'
import { assertRecord, isRecord } from 'ts-is-record'
import stringHash from 'string-hash'
import hash from 'hash-sum'
import { Dict } from 'ts-micro-dict'
import fc from 'fast-check'
import {
  isTemplateItem,
  LiteralSpec,
  OptionalSpec,
  Spec,
  TemplateItemArray,
  UnionSpec,
  UnknownSpec
} from '../../src/spec'
import {
  allSpecs,
  Arb,
  chance,
  Convert,
  generateKeys,
  identity,
  intersect,
  randomSpec,
  skip,
  Specs,
  terminalSpecs
} from './common'
import { weights } from './weights'
import { pipeWith } from 'pipe-ts'
import { skipPrototypeMethods, templateFloatConfig } from '../common'

const unionCaseMarker = '1501dbd7-b866-465f-8abd-e7c6b111632f'

export const createValidProperty = (depth: number) => {
  const tuple = (specs: Specs, count: number) => {
    const availableSpecs = skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional'])
    const size = chance.integer({ min: 0, max: 2 })
    const genSpecs: Array<Exclude<Spec, OptionalSpec>> = []
    const genArbs: Arb[] = []
    const genConverts: Convert[] = []

    for (let i = 0; i < size; i++) {
      const [spec, arb, convert] = step(availableSpecs, count - 1)
      if (spec[0] !== 'optional') {
        genSpecs.push(spec)
        genArbs.push(arb)
        genConverts.push(convert)
      } else {
        invariant(false, `'optional' is forbidden inside 'tuple'`)
      }
    }

    return [
      ['tuple', genSpecs],
      fc.tuple(...genArbs),
      (xs: unknown) => {
        if (Array.isArray(xs)) {
          return (xs as readonly unknown[]).map((x, i) => genConverts[i]?.(x))
        }

        return invariant(false, `'tuple' should be an array`)
      }
    ] as const
  }

  const array = (specs: Specs, count: number) => {
    const [spec, arb, convert] = step(
      skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional']),
      count - 1
    )

    return [
      ['array', spec],
      fc.array(arb),
      (xs: unknown) => {
        if (Array.isArray(xs)) {
          return (xs as readonly unknown[]).map(convert)
        }

        return invariant(false, `'array' should be an array`)
      }
    ] as const
  }

  const filteredArray = (specs: Specs, count: number) => {
    const filter = (x: unknown) => String(JSON.stringify(x)).length > 25
    const [spec, arb, convert] = step(skip([...specs, 'unknown', 'union'], ['optional']), count - 1)

    return [
      ['array', spec, ['function', '(x) => String(JSON.stringify(x)).length > 25']],
      fc.array(arb).map((arr) => arr.filter(filter)),
      (xs: unknown) => {
        if (Array.isArray(xs)) {
          return (xs as readonly unknown[]).map(convert).filter(filter)
        }

        return invariant(false, `'array' should be an array`)
      }
    ] as const
  }

  const record = (specs: Specs, count: number) => {
    const [keySpec, keyArb, keyConvert] = step(
      intersect(specs, [
        'string',
        'template',
        'limit-string',
        'string-literal',
        'literal-union',
        'map-string-string',
        'map-string-number'
      ]),
      count - 1
    )

    const [valueSpec, valueArb, valueConvert] = step(
      skip([...specs, 'union', 'transforming-union', 'unknown'], ['optional']),
      count - 1
    )

    return [
      ['record', keySpec, valueSpec],
      fc.dictionary(
        keyArb.map((x) => (typeof x === 'string' ? x : 'INVALID_KEY')).filter(skipPrototypeMethods),
        valueArb
      ),
      (rec: unknown) => {
        assertRecord(rec, `'record' should be an object`)

        return Object.keys(rec).reduce<Record<string, unknown>>((acc, key) => {
          const convKey = keyConvert(key)
          if (typeof convKey === 'string' || typeof convKey === 'number') {
            acc[convKey] = valueConvert(rec[key])
          } else {
            invariant(false, `key of 'record' should be a string or a number`)
          }
          return acc
        }, {})
      }
    ] as const
  }

  const filteredRecord = (specs: Specs, count: number) => {
    const keyFilter = (x: unknown) => String(x).length > 3
    const valueFilter = (x: unknown) => String(JSON.stringify(x)).length > 25
    const [keySpec, keyArb, keyConvert] = step(
      skip(
        intersect(specs, ['string', 'template', 'limit-string', 'string-literal', 'literal-union']),
        ['map-string-string', 'map-unknown-string', 'map-string-number']
      ),
      count - 1
    )

    const [valueSpec, valueArb, valueConvert] = step(
      skip([...specs, 'union', 'unknown'], ['optional']),
      count - 1
    )

    return [
      [
        'record',
        keySpec,
        valueSpec,
        ['function', '(x) => String(x).length > 3'],
        ['function', '(x) => String(JSON.stringify(x)).length > 25']
      ],
      fc.dictionary(
        keyArb.map((x) => (typeof x === 'string' ? x : 'INVALID_KEY')).filter(skipPrototypeMethods),
        valueArb
      ),
      (rec: unknown) => {
        assertRecord(rec, `'record' should be an object`)

        return Dict.filter(
          (item, key) => keyFilter(key) && valueFilter(item),
          Object.keys(rec).reduce<Record<string, unknown>>((acc, key) => {
            const convKey = keyConvert(key)
            if (typeof convKey === 'string' || typeof convKey === 'number') {
              acc[convKey] = valueConvert(rec[key])
            } else {
              invariant(false, `key of 'record' should be a string or a number`)
            }
            return acc
          }, {})
        )
      }
    ] as const
  }

  const object = (specs: Specs, count: number) => {
    const keys = generateKeys()
    const genSpecs: Record<string, Spec> = {}
    const genArbs: Record<string, Arb> = {}
    const genConverts: Record<string, Convert> = {}

    for (const key of keys) {
      const [spec, arb, convert] = step(
        [...specs, 'optional', 'union', 'transforming-union', 'unknown'],
        count - 1
      )
      genSpecs[key] = spec
      genArbs[key] = arb
      genConverts[key] = convert
    }

    return [
      ['object', genSpecs],
      fc.record(genArbs),
      (obj: unknown) => {
        assertRecord(obj, `'object' should be a record`)

        return Dict.map((v, k) => genConverts[String(k)]?.(v), obj)
      }
    ] as const
  }

  const tupleArray = (specs: Specs, count: number, filtered: boolean) => {
    const [[, tupleSpec], tupleArb, tupleConvert] = tuple(specs, count)
    const [[, ...arraySpec], arrayArb, arrayConvert] = (filtered ? filteredArray : array)(
      specs,
      count
    )

    return [
      ['tupleArray', tupleSpec, ...arraySpec],
      fc.tuple(tupleArb, arrayArb).map(([tup, arr]) => [...tup, ...arr]),
      (xs: unknown) => {
        if (Array.isArray(xs)) {
          const tup = tupleConvert((xs as readonly unknown[]).slice(0, tupleSpec.length))
          const arr = arrayConvert((xs as readonly unknown[]).slice(tupleSpec.length))

          if (Array.isArray(tup) && Array.isArray(arr)) {
            return [...tup, ...arr]
          }
        }

        return invariant(false, `'tupleArray' should be an array`)
      }
    ] as const
  }

  const objectRecord = (specs: Specs, count: number, filtered: boolean) => {
    const [[, objectSpec], objectArb, objectConvert] = object(specs, count)
    const [[, ...recordSpec], recordArb, recordConvert] = (filtered ? filteredRecord : record)(
      specs,
      count
    )

    return [
      ['objectRecord', objectSpec, ...recordSpec],
      fc.tuple(objectArb, recordArb).map(([obj, rec]) => ({ ...rec, ...obj })),
      (xs: unknown) => {
        if (isRecord(xs)) {
          const obj: Record<string, unknown> = {}
          const rec: Record<string, unknown> = {}

          for (const key in xs) {
            if (key in objectSpec) {
              obj[key] = xs[key]
            } else {
              rec[key] = xs[key]
            }
          }

          const convObj = objectConvert(obj)
          const convRec = recordConvert(rec)

          if (isRecord(convObj) && isRecord(convRec)) {
            return { ...convRec, ...convObj }
          }
        }

        return invariant(false, `'objectRecord' should be an object`)
      }
    ] as const
  }

  const step = (specs: Specs, count: number): readonly [Spec, Arb, Convert] => {
    const specName = randomSpec(count === 0 ? intersect(specs, terminalSpecs) : specs, weights)

    switch (specName) {
      case 'string-literal': {
        const str = chance.string()

        return [['literal', ['string', str]], fc.constant(str), identity]
      }

      case 'null-literal':
        return [['literal', ['null']], fc.constant(null), identity]

      case 'numeric-literal': {
        const num = chance.integer()

        return [['literal', ['numeric', num]], fc.constant(num), identity]
      }

      case 'boolean-literal': {
        const bool = chance.bool()

        return [['literal', ['boolean', bool]], fc.constant(bool), identity]
      }

      case 'undefined-literal':
        return [['literal', ['identifier', 'undefined']], fc.constant(undefined), identity]

      case 'number':
        return [['number'], fc.float(templateFloatConfig), identity]

      case 'string':
        return [['string'], fc.string(), identity]

      case 'boolean':
        return [['boolean'], fc.boolean(), identity]

      case 'unknown':
        return [['unknown'], fc.anything(), identity]

      case 'nullish':
        return [['nullish'], fc.oneof(fc.constant(undefined), fc.constant(null)), () => undefined]

      case 'optional': {
        const [spec, arb, convert] = step(
          skip([...specs, 'union', 'transforming-union'], ['optional']),
          count - 1
        )

        return [
          ['optional', spec],
          fc.option(arb, { nil: undefined }),
          (x) => (x !== undefined ? convert(x) : undefined)
        ]
      }

      case 'template': {
        const availableSpecs = skip([...terminalSpecs, 'template-union'] as const, [
          'unknown',
          'nullish'
        ])
        const size = chance.integer({ min: 0, max: 10 })
        const genSpecs: Array<TemplateItemArray[number]> = []
        const genArbs: Arb[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb] = step(availableSpecs, count - 1)
          if (isTemplateItem(spec)) {
            genSpecs.push(spec)
            genArbs.push(arb)
          }
        }

        return [
          ['template', genSpecs],
          fc
            .tuple(...genArbs)
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          identity
        ]
      }

      case 'filtered-array':
        return filteredArray(specs, count)

      case 'filtered-record':
        return filteredRecord(specs, count)

      case 'tuple':
        return tuple(specs, count)

      case 'template-union': {
        const availableSpecs = skip(terminalSpecs, [
          'unknown',
          'nullish',
          'template',
          'limit-string'
        ])

        const size = chance.integer({ min: 1, max: 5 })
        const genSpecs: Array<TemplateItemArray[number]> = []
        const genArbs: Arb[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb] = step(availableSpecs, count - 1)
          if (isTemplateItem(spec)) {
            genSpecs.push(spec)
            genArbs.push(arb)
          }
        }

        return [['union', genSpecs], fc.oneof(...genArbs), identity]
      }

      case 'literal-union': {
        const availableSpecs = ['string-literal'] as const

        const size = chance.integer({ min: 1, max: 5 })
        const genSpecs: LiteralSpec[] = []
        const genArbs: Arb[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb] = step(availableSpecs, count - 1)
          if (spec[0] === 'literal') {
            genSpecs.push(spec)
            genArbs.push(arb)
          }
        }

        return [['union', genSpecs], fc.oneof(...genArbs), identity]
      }

      case 'union': {
        const availableSpecs = skip(specs, [
          'optional',
          'union',
          'transforming-union',
          'literal-union',
          'unknown',
          'nullish',
          'struct',
          'map-string-number',
          'map-string-string',
          'map-unknown-string',
          'filtered-array',
          'filtered-tuple-array',
          'filtered-record',
          'filtered-object-record'
        ])
        const size = chance.integer({ min: 1, max: 10 })
        const genSpecs: Array<Exclude<Spec, OptionalSpec | UnionSpec | UnknownSpec>> = []
        const genArbs: Arb[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb] = step(availableSpecs, count - 1)
          if (spec[0] !== 'optional' && spec[0] !== 'union' && spec[0] !== 'unknown') {
            genSpecs.push(spec)
            genArbs.push(arb)
          }
        }

        return [['union', genSpecs], fc.oneof(...genArbs), identity]
      }

      case 'transforming-union': {
        const availableSpecs = specs
        const size = chance.integer({ min: 1, max: 10 })
        const genSpecs: Spec[] = []
        const genArbs: Arb[] = []
        const genConverts: Convert[] = []

        for (let i = 0; i < size; i++) {
          const [spec, arb, convert] = step(availableSpecs, count - 1)
          genSpecs.push([
            'tuple',
            [['literal', ['string', unionCaseMarker]], ['literal', ['numeric', i]], spec]
          ])
          genArbs.push(fc.tuple(fc.constant(unionCaseMarker), fc.constant(i), arb))
          genConverts.push(convert)
        }

        return [
          ['union', genSpecs],
          fc.oneof(...genArbs),
          (x: unknown) => {
            if (Array.isArray(x)) {
              const xs: readonly unknown[] = x
              if (xs[0] === unionCaseMarker && typeof xs[1] === 'number' && xs.length === 3) {
                return [xs[0], xs[1], genConverts[xs[1]]?.(xs[2])]
              }
            }

            invariant(false, `invalid 'transforming-union'`)
            return []
          }
        ]
      }

      case 'array':
        return array(specs, count)

      case 'object':
        return object(specs, count)

      case 'struct': {
        const keys = generateKeys()
        const extraKeys = generateKeys(3)
        const genSpecs: Record<string, Spec> = {}
        const genArbs: Record<string, Arb> = {}
        const genConverts: Record<string, Convert> = {}

        for (const key of extraKeys) {
          genArbs[key] = step(specs, count - 1)[1]
        }

        for (const key of keys) {
          const [spec, arb, convert] = step(
            [...specs, 'optional', 'union', 'transforming-union', 'unknown'],
            count - 1
          )
          genSpecs[key] = spec
          genArbs[key] = arb
          genConverts[key] = convert
        }

        return [
          ['struct', genSpecs],
          fc.record(genArbs),
          (struct) => {
            assertRecord(struct, `'struct' should be an object`)

            return pipeWith(
              struct,
              Dict.filter((_, k) => k in genConverts),
              Dict.map((v, k) => genConverts[String(k)]?.(v))
            )
          }
        ]
      }

      case 'limit': {
        const [spec, arb, convert] = step(skip(specs, ['optional']), count - 1)
        // eslint-disable-next-line no-self-compare
        const limit = (x: unknown) => x === x || (typeof x === 'number' && isNaN(x))

        return [
          ['limit', spec, ['function', "(x) => x === x || (typeof x === 'number' && isNaN(x))"]],
          arb.filter(limit),
          convert
        ]
      }

      case 'limit-number': {
        const limit = (x: number) => x % 2 === 0

        return [['limit', ['number'], ['identifier', 'isEven']], fc.nat().filter(limit), identity]
      }

      case 'limit-string': {
        const limit = (x: string) => Boolean(x.length % 2)

        return [
          ['limit', ['string'], ['function', '(x) => Boolean(x.length % 2)']],
          fc.string().filter(limit),
          identity
        ]
      }

      case 'map-unknown-string': {
        const [spec, arb, convert] = step(skip(specs, ['optional']), count - 1)

        return [['map', spec, ['identifier', 'hash']], arb, (x) => hash(convert(x))]
      }

      case 'map-string-number': {
        return [
          ['map', ['string'], ['function', String(stringHash)]],
          fc.string(),
          (x) => {
            if (typeof x === 'string') {
              return stringHash(x)
            }

            return invariant(false, `'map-string-number' should be a string`)
          }
        ]
      }

      case 'map-string-string': {
        const map = (x: unknown) => JSON.stringify(x)

        return [['map', ['string'], ['function', '(x) => JSON.stringify(x)']], fc.string(), map]
      }

      case 'record':
        return record(specs, count)

      case 'writable': {
        const [spec, arb, convert] = step(specs, count - 1)

        return [['writable', spec], arb, convert]
      }

      case 'tuple-array':
        return tupleArray(specs, count, false)

      case 'filtered-tuple-array':
        return tupleArray(specs, count, true)

      case 'object-record':
        return objectRecord(specs, count, false)

      case 'filtered-object-record':
        return objectRecord(specs, count, true)
    }
  }

  return step(skip(allSpecs, ['template-union']), depth)
}
