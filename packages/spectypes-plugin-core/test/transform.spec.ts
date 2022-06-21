/* eslint-disable no-null/no-null */
import { inspect } from 'util'
import * as fc from 'fast-check'
import { Result } from 'ts-railway'
import { Dict } from 'ts-micro-dict'
import { isDefined } from 'ts-is-defined'
import { stringify } from 'stringify-parse'
import * as spectypes from 'spectypes'
import { createInvalidProperty, createValidProperty, injectError } from './property'
import { CreateGenerateCheck, Error, Path } from './common'
import { pipeWith } from 'pipe-ts'
import { createGenerateCheck as babelCreateGenerateCheck } from '../../babel-plugin-spectypes/test/transform'

const isCI = isDefined(process.env.CI) && process.env.CI !== ''
const numRuns = isCI ? 350 : 100
const inspectConfig = { showHidden: false, depth: null, colors: true } as const

const prefix = `
  const hash = require('hash-sum');
  const isEven = (x) => x % 2 === 0;
  const str = 'STRING';
  const _js = ${stringify(spectypes)};
`

const compareObjects = (x: unknown, y: unknown) =>
  JSON.stringify(x).localeCompare(JSON.stringify(y))

const createSuite = (createGenerateCheck: CreateGenerateCheck) => {
  const generateCheck = createGenerateCheck(prefix)

  describe('transform - success', () => {
    test('number', () => {
      const check = generateCheck(['number'])

      fc.assert(
        fc.property(fc.oneof(fc.float(), fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('record(union(literal("foo"), literal("bar")), number)', () => {
      const check = generateCheck([
        'record',
        [
          'union',
          [
            ['literal', ['string', 'foo']],
            ['literal', ['string', 'bar']]
          ]
        ],
        ['number']
      ])

      fc.assert(
        fc.property(
          fc.dictionary(fc.oneof(fc.constant('foo'), fc.constant('bar')), fc.float()),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('record(union(literal("foo"), map(literal("bar"), () => "test")), number)', () => {
      const check = generateCheck([
        'record',
        [
          'union',
          [
            ['literal', ['string', 'foo']],
            ['map', ['literal', ['string', 'bar']], ['function', "() => 'test'"]]
          ]
        ],
        ['number']
      ])

      fc.assert(
        fc.property(
          fc.dictionary(fc.oneof(fc.constant('foo'), fc.constant('bar')), fc.float()),
          (val) => {
            expect(check(val)).toEqual(
              Result.success(
                pipeWith(val, Dict.omit('bar'), (dict) =>
                  isDefined(val.bar) ? Dict.put('test', val.bar, dict) : dict
                )
              )
            )
          }
        ),
        { numRuns }
      )
    })

    test('tuple(literal(5), literal(null), literal("test"), literal(false), literal(undefined))', () => {
      const check = generateCheck([
        'tuple',
        [
          ['literal', ['numeric', 5]],
          ['literal', ['null']],
          ['literal', ['string', 'test']],
          ['literal', ['boolean', false]],
          ['literal', ['identifier', 'undefined']]
        ]
      ])

      fc.assert(
        fc.property(
          fc.tuple(
            fc.constant(5),
            fc.constant(null),
            fc.constant('test'),
            fc.constant(false),
            fc.constant(undefined)
          ),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('string', () => {
      const check = generateCheck(['string'])

      fc.assert(
        fc.property(fc.string(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('boolean', () => {
      const check = generateCheck(['boolean'])

      fc.assert(
        fc.property(fc.boolean(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('nullish', () => {
      const check = generateCheck(['nullish'])

      fc.assert(
        fc.property(fc.oneof(fc.constant(null), fc.constant(undefined)), (val) => {
          expect(check(val)).toEqual(Result.success(undefined))
        }),
        { numRuns }
      )
    })

    test('optional(boolean)', () => {
      const check = generateCheck(['optional', ['boolean']])

      fc.assert(
        fc.property(fc.option(fc.boolean(), { nil: undefined }), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('template', () => {
      const check = generateCheck([
        'template',
        [
          ['string'],
          ['literal', ['string', '-']],
          ['number'],
          ['literal', ['null']],
          ['boolean'],
          ['literal', ['numeric', 5]],
          ['literal', ['identifier', 'undefined']],
          ['literal', ['boolean', true]]
        ]
      ])

      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.string(),
              fc.constant('-'),
              fc.oneof(fc.float(), fc.integer()),
              fc.constant(null),
              fc.boolean(),
              fc.constant(5),
              fc.constant(undefined),
              fc.constant(true)
            )
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('template(union, union)', () => {
      const check = generateCheck([
        'template',
        [
          [
            'union',
            [
              ['literal', ['string', '-']],
              ['literal', ['null']],
              ['literal', ['boolean', false]]
            ]
          ],
          [
            'union',
            [
              ['literal', ['numeric', 5]],
              ['literal', ['identifier', 'undefined']],
              ['literal', ['boolean', true]]
            ]
          ]
        ]
      ])

      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.oneof(fc.constant('-'), fc.constant(null), fc.constant(false)),
              fc.oneof(fc.constant(5), fc.constant(undefined), fc.constant(true))
            )
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('unknown', () => {
      const check = generateCheck(['unknown'])

      fc.assert(
        fc.property(fc.anything(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('record(unknown)', () => {
      const check = generateCheck(['record', ['string'], ['unknown']])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test("UNSAFE_record(literal('toString'), unknown)", () => {
      const check = generateCheck([
        'UNSAFE_record',
        ['literal', ['string', 'toString']],
        ['unknown']
      ])

      fc.assert(
        fc.property(
          fc
            .dictionary(fc.constant('toString'), fc.anything())
            .filter((rec) => Object.keys(rec).length > 0),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test("UNSAFE_objectRecord({}, literal('toString'), unknown)", () => {
      const check = generateCheck([
        'UNSAFE_objectRecord',
        {},
        ['literal', ['string', 'toString']],
        ['unknown']
      ])

      fc.assert(
        fc.property(
          fc
            .dictionary(fc.constant('toString'), fc.anything())
            .filter((rec) => Object.keys(rec).length > 0),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('merge(object({}, record(unknown))', () => {
      const check = generateCheck(['objectRecord', {}, ['string'], ['unknown']])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('object({ x: unknown, y: number })', () => {
      const check = generateCheck(['object', { x: ['unknown'], y: ['number'] }])

      fc.assert(
        fc.property(fc.record({ x: fc.anything(), y: fc.nat() }), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('array(number)', () => {
      const check = generateCheck(['array', ['number']])

      fc.assert(
        fc.property(fc.array(fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('array(filter(number, x => x > 1))', () => {
      const check = generateCheck(['array', ['number'], ['function', 'x => x > 1']])

      fc.assert(
        fc.property(fc.array(fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val.filter((x) => x > 1)))
        }),
        { numRuns }
      )
    })

    test('array(filter(map(number, x => x - 10), x => x > 1))', () => {
      const check = generateCheck([
        'array',
        ['map', ['number'], ['function', 'x => x - 10']],
        ['function', 'x => x > 1']
      ])

      fc.assert(
        fc.property(fc.array(fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val.map((x) => x - 10).filter((x) => x > 1)))
        }),
        { numRuns }
      )
    })

    test('array(filter(number, isEven))', () => {
      const check = generateCheck(['array', ['number'], ['identifier', 'isEven']])

      fc.assert(
        fc.property(fc.array(fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val.filter((x) => x % 2 === 0)))
        }),
        { numRuns }
      )
    })

    test('tupleArray([string], filter(number, isEven))', () => {
      const check = generateCheck([
        'tupleArray',
        [['string']],
        ['number'],
        ['identifier', 'isEven']
      ])

      fc.assert(
        fc.property(fc.tuple(fc.string()), fc.array(fc.integer()), (tup, arr) => {
          const val = [...tup, ...arr.filter((x) => x % 2 === 0)]
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('tupleArray([string], filter(number, x => x > 1))', () => {
      const check = generateCheck([
        'tupleArray',
        [['string']],
        ['number'],
        ['function', 'x => x > 1']
      ])

      fc.assert(
        fc.property(fc.tuple(fc.string()), fc.array(fc.integer()), (tup, arr) => {
          const val = [...tup, ...arr.filter((x) => x > 1)]
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('tuple(number, string, boolean)', () => {
      const check = generateCheck(['tuple', [['number'], ['string'], ['boolean']]])

      fc.assert(
        fc.property(fc.tuple(fc.float(), fc.string(), fc.boolean()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('union(number, string, boolean)', () => {
      const check = generateCheck(['union', [['number'], ['string'], ['boolean']]])

      fc.assert(
        fc.property(fc.oneof(fc.float(), fc.string(), fc.boolean()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('object({ x: number, y: string, z: boolean })', () => {
      const check = generateCheck(['object', { x: ['number'], y: ['string'], z: ['boolean'] }])

      fc.assert(
        fc.property(fc.record({ x: fc.nat(), y: fc.string(), z: fc.boolean() }), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('struct({ x: number, y: string, z: boolean })', () => {
      const check = generateCheck(['struct', { x: ['number'], y: ['string'], z: ['boolean'] }])

      fc.assert(
        fc.property(
          fc.record({ a: fc.anything(), x: fc.nat(), y: fc.string(), z: fc.boolean() }),
          (val) => {
            const { a, ...rest } = val
            expect(check(val)).toEqual(Result.success(rest))
          }
        ),
        { numRuns }
      )
    })

    test('record(number)', () => {
      const check = generateCheck(['record', ['string'], ['number']])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('record(filter(number, x => x % 2 === 0))', () => {
      const check = generateCheck([
        'record',
        ['string'],
        ['number'],
        undefined,
        ['function', 'x => x % 2 === 0']
      ])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(Dict.filter((x) => x % 2 === 0, val)))
        }),
        { numRuns }
      )
    })

    test('record(filter(string, x => x.length < 5), number)', () => {
      const check = generateCheck([
        'record',
        ['string'],
        ['number'],
        ['function', 'x => x.length < 5']
      ])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.integer()), (val) => {
          expect(check(val)).toEqual(Result.success(Dict.filter((_, x) => x.length < 5, val)))
        }),
        { numRuns }
      )
    })

    test('record(filter(string, x => x.length < 5), filter(number, x => x % 2 === 0))', () => {
      const check = generateCheck([
        'record',
        ['string'],
        ['number'],
        ['function', 'x => x.length < 5'],
        ['function', 'x => x % 2 === 0']
      ])

      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.integer()), (val) => {
          expect(check(val)).toEqual(
            Result.success(Dict.filter((v, k) => k.length < 5 && v % 2 === 0, val))
          )
        }),
        { numRuns }
      )
    })

    test('limit(number, x => x % 2)', () => {
      const check = generateCheck(['limit', ['number'], ['function', 'x => x % 2']])

      fc.assert(
        fc.property(
          fc.integer().filter((x) => Boolean(x % 2)),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('map(string, x => x + x)', () => {
      const check = generateCheck(['map', ['string'], ['function', 'x => x + x']])

      fc.assert(
        fc.property(
          fc.string().map((x) => x + x),
          (val) => {
            expect(check(val)).toEqual(Result.success(val + val))
          }
        ),
        { numRuns }
      )
    })

    test('tupleArray([boolean, string], number)', () => {
      const check = generateCheck(['tupleArray', [['boolean'], ['string']], ['number']])

      fc.assert(
        fc.property(fc.tuple(fc.boolean(), fc.string()), fc.array(fc.integer()), (tup, arr) => {
          const val = [...tup, ...arr]
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('objectRecord({ x: boolean, y: string }, number)', () => {
      const check = generateCheck([
        'objectRecord',
        { x: ['boolean'], y: ['string'] },
        ['string'],
        ['number']
      ])

      fc.assert(
        fc.property(
          fc.record({ x: fc.boolean(), y: fc.string() }),
          fc.dictionary(fc.string(), fc.nat()),
          (obj, rec) => {
            const val = { ...rec, ...obj }
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('objectRecord({ x: boolean, y: string }, filter(number, x => x % 2 === 0))', () => {
      const check = generateCheck([
        'objectRecord',
        { x: ['boolean'], y: ['string'] },
        ['string'],
        ['number'],
        undefined,
        ['function', 'x => x % 2 === 0']
      ])

      fc.assert(
        fc.property(
          fc.record({ x: fc.boolean(), y: fc.string() }),
          fc.dictionary(
            fc.string(),
            fc.nat().filter((x) => x % 2 === 0)
          ),
          (obj, rec) => {
            const val = { ...rec, ...obj }
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('objectRecord({ x: boolean, y: string }, filter(string, x => x.length > 4), number)', () => {
      const check = generateCheck([
        'objectRecord',
        { x: ['boolean'], y: ['string'] },
        ['string'],
        ['number'],
        ['function', 'x => x.length > 4']
      ])

      fc.assert(
        fc.property(
          fc.record({ x: fc.boolean(), y: fc.string() }),
          fc.dictionary(
            fc.string().filter((x) => x.length > 4),
            fc.nat()
          ),
          (obj, rec) => {
            const val = { ...rec, ...obj }
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('writable', () => {
      const check = generateCheck(['writable', ['string']])

      fc.assert(
        fc.property(fc.string(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('union(string, validator(check))', () => {
      const check = generateCheck(
        ['union', [['string'], ['validator', ['external', ['identifier', 'check1']]]]],
        ['number']
      )

      fc.assert(
        fc.property(fc.nat(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('validator(number)', () => {
      const check = generateCheck(['validator', ['external', ['identifier', 'check1']]], ['number'])

      fc.assert(
        fc.property(fc.nat(), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('union(limit(number), limit(string))', () => {
      const check = generateCheck([
        'union',
        [
          ['limit', ['number'], ['function', 'x => x > 5']],
          ['limit', ['string'], ['function', 'x => x.length > 5']]
        ]
      ])

      fc.assert(
        fc.property(
          fc.nat().filter((x) => x > 5),
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('union(struct({ x: number, y: boolean }), struct({ y: string, z: number }))', () => {
      const check = generateCheck([
        'union',
        [
          ['struct', { x: ['number'], y: ['boolean'] }],
          ['struct', { y: ['string'], z: ['number'] }]
        ]
      ])

      fc.assert(
        fc.property(
          fc.record({ x: fc.nat(), y: fc.oneof(fc.boolean(), fc.string()), z: fc.nat() }),
          (val) => {
            const { x, y, z } = val
            expect(check(val)).toEqual(Result.success(typeof y === 'string' ? { y, z } : { x, y }))
          }
        ),
        { numRuns }
      )
    })

    test('transformer(map(number, x => x + 1))', () => {
      const check = generateCheck(
        ['transformer', ['external', ['identifier', 'check1']]],
        ['map', ['number'], ['function', 'x => x + 1']]
      )

      fc.assert(
        fc.property(fc.nat(), (val) => {
          expect(check(val)).toEqual(Result.success(val + 1))
        }),
        { numRuns }
      )
    })

    test('struct({ x: union(external(map(number, x => x + 1)), string) })', () => {
      const check = generateCheck(
        ['struct', { x: ['union', [['external', ['identifier', 'check1']], ['string']]] }],
        ['map', ['number'], ['function', 'x => x + 1']]
      )

      fc.assert(
        fc.property(fc.record({ x: fc.oneof(fc.nat(), fc.string()), y: fc.boolean() }), (val) => {
          const { x } = val
          expect(check(val)).toEqual(Result.success({ x: typeof x === 'string' ? x : x + 1 }))
        }),
        { numRuns }
      )
    })

    test('struct({ x: external(map(number, x => x + 1)) })', () => {
      const check = generateCheck(
        ['struct', { x: ['external', ['identifier', 'check1']] }],
        ['map', ['number'], ['function', 'x => x + 1']]
      )

      fc.assert(
        fc.property(fc.record({ x: fc.nat() }), (val) => {
          const { x } = val
          expect(check(val)).toEqual(Result.success({ x: x + 1 }))
        }),
        { numRuns }
      )
    })

    test('lazy', () => {
      const check = generateCheck([
        'lazy',
        [
          'object',
          {
            id: ['string'],
            items: ['array', ['validator', ['external', ['identifier', 'check0']]]]
          }
        ]
      ])

      fc.assert(
        fc.property(
          fc.letrec((tie) => ({
            node: fc.record({
              id: fc.string(),
              items: fc.option(fc.array(tie('node')), {
                maxDepth: 2,
                depthIdentifier: 'tree',
                nil: []
              })
            })
          })).node,
          (val) => {
            expect(check(val)).toEqual(Result.success(val))
          }
        ),
        { numRuns }
      )
    })

    test('optional(struct({ x: string }))', () => {
      const check = generateCheck(['optional', ['struct', { x: ['string'] }]])

      fc.assert(
        fc.property(
          fc.option(fc.record({ x: fc.string(), y: fc.anything() }), { nil: undefined }),
          (val) => {
            const rest = isDefined(val) ? { x: val.x } : val
            expect(check(val)).toEqual(Result.success(rest))
          }
        ),
        { numRuns }
      )
    })

    test('object({ x: string, y: struct({ z: boolean }) })', () => {
      const check = generateCheck(['object', { x: ['string'], y: ['struct', { z: ['boolean'] }] }])

      fc.assert(
        fc.property(
          fc.record({ x: fc.string(), y: fc.record({ z: fc.boolean(), foo: fc.nat() }) }),
          (val) => {
            const { z } = val.y
            expect(check(val)).toEqual(Result.success({ ...val, y: { z } }))
          }
        ),
        { numRuns }
      )
    })

    test('struct({ x: optional(string) })', () => {
      const check = generateCheck(['struct', { x: ['optional', ['string']] }])

      fc.assert(
        fc.property(fc.record({ x: fc.option(fc.string(), { nil: undefined }) }), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('template(identifier)', () => {
      const check = generateCheck(['template', [['literal', ['identifier', 'str']]]])

      fc.assert(
        fc.property(fc.constant('STRING'), (val) => {
          expect(check(val)).toEqual(Result.success(val))
        }),
        { numRuns }
      )
    })

    test('struct({ x: tuple(optional(map(number, x => x + 1))) })', () => {
      const check = generateCheck([
        'struct',
        { x: ['tuple', [['optional', ['map', ['number'], ['function', 'x => x + 1']]]]] }
      ])

      fc.assert(
        fc.property(
          fc.record({ x: fc.tuple(fc.option(fc.float(), { nil: undefined })) }),
          (val) => {
            const {
              x: [v]
            } = val
            expect(check(val)).toEqual(Result.success({ x: [v === undefined ? v : v + 1] }))
          }
        ),
        { numRuns }
      )
    })

    test('union(map(number, x => x + 1), map(string, x => x.length))', () => {
      const check = generateCheck([
        'union',
        [
          ['map', ['number'], ['function', 'x => x + 1']],
          ['map', ['string'], ['function', 'x => x.length']],
          ['boolean']
        ]
      ])

      fc.assert(
        fc.property(fc.oneof(fc.nat(), fc.string(), fc.boolean()), (val) => {
          expect(check(val)).toEqual(
            Result.success(
              typeof val === 'number' ? val + 1 : typeof val === 'string' ? val.length : val
            )
          )
        }),
        { numRuns }
      )
    })

    test("union(struct({ '': number }), nullish)", () => {
      const check = generateCheck(['union', [['struct', { '': ['number'] }], ['nullish']]])

      fc.assert(
        fc.property(
          fc.oneof(fc.record({ '': fc.nat() }), fc.option(fc.constant(null), { nil: undefined })),
          (val) => {
            expect(check(val)).toEqual(Result.success(val ?? undefined))
          }
        ),
        { numRuns }
      )
    })
  })

  describe('transform - failure', () => {
    test('number', () => {
      const check = generateCheck(['number'])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'number'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a number', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('tuple(literal(5), literal(null), literal("test"), literal(false), literal(undefined))', () => {
      const check = generateCheck([
        'tuple',
        [
          ['literal', ['numeric', 5]],
          ['literal', ['null']],
          ['literal', ['string', 'test']],
          ['literal', ['boolean', false]],
          ['literal', ['identifier', 'undefined']]
        ]
      ])

      fc.assert(
        fc.property(
          fc.tuple(
            fc.constant(5),
            fc.constant(null),
            fc.anything().filter((x) => x !== 'test'),
            fc.constant(false),
            fc.constant(undefined)
          ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: "not a 'test' string literal", path: [2] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('string', () => {
      const check = generateCheck(['string'])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'string'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('boolean', () => {
      const check = generateCheck(['boolean'])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'boolean'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a boolean', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('nullish', () => {
      const check = generateCheck(['nullish'])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => x !== null && x !== undefined),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: "not 'null' or 'undefined'", path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('optional(boolean)', () => {
      const check = generateCheck(['optional', ['boolean']])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => x !== undefined && typeof x !== 'boolean'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a boolean', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('template', () => {
      const check = generateCheck([
        'template',
        [
          ['string'],
          ['literal', ['string', '-']],
          ['number'],
          ['literal', ['null']],
          ['boolean'],
          ['literal', ['numeric', 5]],
          ['literal', ['identifier', 'undefined']],
          ['literal', ['boolean', true]]
        ]
      ])

      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.string(),
              fc.constant('-'),
              fc.oneof(fc.float(), fc.integer()),
              fc.string().filter((x) => x !== 'null'),
              fc.boolean(),
              fc.string().filter((x) => x !== '5'),
              fc.constant(undefined),
              fc.constant(true)
            )
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'template literal mismatch', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('template(union, union)', () => {
      const check = generateCheck([
        'template',
        [
          [
            'union',
            [
              ['literal', ['string', '-']],
              ['literal', ['null']],
              ['literal', ['boolean', false]]
            ]
          ],
          [
            'union',
            [
              ['literal', ['numeric', 5]],
              ['literal', ['identifier', 'undefined']],
              ['literal', ['boolean', true]]
            ]
          ]
        ]
      ])

      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.string().filter((x) => x !== '-' && x !== 'null' && x !== 'false'),
              fc.string().filter((x) => x !== '5' && x !== 'undefined' && x !== 'true')
            )
            .map((items) => items.reduce<string>((acc, val) => `${acc}${String(val)}`, '')),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'template literal mismatch', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('record(union(literal("foo"), literal("bar")), number)', () => {
      const check = generateCheck([
        'record',
        [
          'union',
          [
            ['literal', ['string', 'foo']],
            ['literal', ['string', 'bar']]
          ]
        ],
        ['number']
      ])

      fc.assert(
        fc.property(
          fc
            .dictionary(
              fc.string().filter((x) => x !== 'foo' && x !== 'bar'),
              fc.float()
            )
            .filter((x) => Object.keys(x).length > 0),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: Object.keys(val).flatMap((key) => [
                  {
                    issue: "key issue: union case #0 mismatch: not a 'foo' string literal",
                    path: [key]
                  },
                  {
                    issue: "key issue: union case #1 mismatch: not a 'bar' string literal",
                    path: [key]
                  }
                ])
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('object({ x: unknown, y: number })', () => {
      const check = generateCheck(['object', { x: ['unknown'], y: ['number'] }])

      fc.assert(
        fc.property(fc.record({ y: fc.nat() }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'missing key - x', path: [] }]
            })
          )
        }),
        { numRuns }
      )
    })

    test('array(number)', () => {
      const check = generateCheck(['array', ['number']])

      fc.assert(
        fc.property(
          fc.array(
            fc.anything().filter((x) => typeof x !== 'number'),
            { minLength: 1 }
          ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: val.map((_, idx) => ({ issue: 'not a number', path: [idx] }))
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => !Array.isArray(x)),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an array', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('tuple(number, string, boolean)', () => {
      const check = generateCheck(['tuple', [['number'], ['string'], ['boolean']]])

      fc.assert(
        fc.property(fc.tuple(fc.float(), fc.string()), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'length is not 3', path: [] }]
            })
          )
        }),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.tuple(
            fc.float(),
            fc.anything().filter((x) => typeof x !== 'string'),
            fc.boolean()
          ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: [1] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => !Array.isArray(x)),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an array', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('union(object({ x: number, y: number }), object({ y: number, z: number }))', () => {
      const check = generateCheck([
        'union',
        [
          ['object', { x: ['number'], y: ['number'] }],
          ['object', { y: ['number'], z: ['number'] }]
        ]
      ])

      fc.assert(
        fc.property(fc.record({ x: fc.nat(), y: fc.nat(), z: fc.nat() }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'union case #0 mismatch: excess key - z', path: [] },
                { issue: 'union case #1 mismatch: excess key - x', path: [] }
              ]
            })
          )
        }),
        { numRuns }
      )
    })

    test('union(number, string, boolean)', () => {
      const check = generateCheck(['union', [['number'], ['string'], ['boolean']]])

      fc.assert(
        fc.property(
          fc
            .anything()
            .filter(
              (x) => typeof x !== 'number' && typeof x !== 'string' && typeof x !== 'boolean'
            ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [
                  {
                    issue: 'union case #0 mismatch: not a number',
                    path: []
                  },
                  {
                    issue: 'union case #1 mismatch: not a string',
                    path: []
                  },
                  {
                    issue: 'union case #2 mismatch: not a boolean',
                    path: []
                  }
                ]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test("record(literal('toString')), unknown)", () => {
      const check = generateCheck(['record', ['literal', ['string', 'toString']], ['unknown']])

      fc.assert(
        fc.property(
          fc
            .dictionary(fc.constant('toString'), fc.anything())
            .filter((rec) => Object.keys(rec).length > 0),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: "includes banned 'toString' key", path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test("objectRecord({}, literal('toString')), unknown)", () => {
      const check = generateCheck([
        'objectRecord',
        {},
        ['literal', ['string', 'toString']],
        ['unknown']
      ])

      fc.assert(
        fc.property(
          fc
            .dictionary(fc.constant('toString'), fc.anything())
            .filter((rec) => Object.keys(rec).length > 0),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: "includes banned 'toString' key", path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('object({ x: number, y: string, z: boolean })', () => {
      const check = generateCheck(['object', { x: ['number'], y: ['string'], z: ['boolean'] }])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.record({
            x: fc.nat(),
            y: fc.anything().filter((x) => typeof x !== 'string'),
            z: fc.boolean()
          }),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: ['y'] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.record({ z: fc.boolean() }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'not a number', path: ['x'] },
                { issue: 'not a string', path: ['y'] }
              ]
            })
          )
        }),
        { numRuns }
      )
    })

    test('struct({ x: number, y: string, z: boolean })', () => {
      const check = generateCheck(['struct', { x: ['number'], y: ['string'], z: ['boolean'] }])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.record({ x: fc.anything().filter((x) => typeof x !== 'number') }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'not a number', path: ['x'] },
                { issue: 'not a string', path: ['y'] },
                { issue: 'not a boolean', path: ['z'] }
              ]
            })
          )
        }),
        { numRuns }
      )
    })

    test('record(number)', () => {
      const check = generateCheck(['record', ['string'], ['number']])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc
            .dictionary(
              fc.string(),
              fc.anything().filter((x) => typeof x !== 'number')
            )
            .filter((x) => Object.keys(x).length !== 0),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: Object.entries(val).map(([k]) => ({ issue: 'not a number', path: [k] }))
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('limit(number, x => x % 2)', () => {
      const check = generateCheck(['limit', ['number'], ['function', 'x => x % 2']])

      fc.assert(
        fc.property(
          fc.integer().filter((x) => x % 2 === 0),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'does not fit the limit', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'number'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a number', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('map(string, x => x + x)', () => {
      const check = generateCheck(['map', ['string'], ['function', 'x => x + x']])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'string'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('tupleArray([boolean, string], number)', () => {
      const check = generateCheck(['tupleArray', [['boolean'], ['string']], ['number']])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => !Array.isArray(x)),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an array', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.tuple(fc.anything()), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'length is less than 2', path: [] }]
            })
          )
        }),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.tuple(
            fc.boolean(),
            fc.anything().filter((x) => typeof x !== 'string')
          ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: [1] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.array(fc.nat(), { minLength: 2 }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'not a boolean', path: [0] },
                { issue: 'not a string', path: [1] }
              ]
            })
          )
        }),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.tuple(fc.boolean(), fc.string()),
          fc.array(
            fc.anything().filter((x) => typeof x !== 'number'),
            { minLength: 1 }
          ),
          (tup, arr) => {
            const val = [...tup, ...arr]
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: arr.map((_, idx) => ({ issue: 'not a number', path: [idx + 2] }))
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('objectRecord({ x: boolean, y: string }, number)', () => {
      const check = generateCheck([
        'objectRecord',
        { x: ['boolean'], y: ['string'] },
        ['string'],
        ['number']
      ])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.record({}), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'not a boolean', path: ['x'] },
                { issue: 'not a string', path: ['y'] }
              ]
            })
          )
        }),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.record({
            x: fc.anything().filter((x) => typeof x !== 'boolean'),
            y: fc.anything().filter((x) => typeof x !== 'string')
          }),
          fc.dictionary(fc.string(), fc.nat()),
          (obj, rec) => {
            const val = { ...rec, ...obj }
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [
                  { issue: 'not a boolean', path: ['x'] },
                  { issue: 'not a string', path: ['y'] }
                ]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.record({ x: fc.boolean(), y: fc.string() }),
          fc
            .dictionary(
              fc.string(),
              fc.anything().filter((x) => typeof x !== 'number')
            )
            .filter((x) => {
              const keys = Object.keys(x)
              return keys.length > 0 && !keys.includes('x') && !keys.includes('y')
            }),
          (obj, rec) => {
            const val = { ...rec, ...obj }
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: Object.entries(val)
                  .filter(([k]) => k !== 'x' && k !== 'y')
                  .map(([k]) => ({ issue: 'not a number', path: [k] }))
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('writable', () => {
      const check = generateCheck(['writable', ['string']])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'string'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('validator(number)', () => {
      const check = generateCheck(['validator', ['external', ['identifier', 'check1']]], ['number'])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'number'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a number', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('validator(object({ x: number }))', () => {
      const check = generateCheck(
        ['validator', ['external', ['identifier', 'check1']]],
        ['object', { x: ['number'] }]
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.record({ x: fc.anything().filter((x) => typeof x !== 'number') }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'not a number', path: ['x'] }]
            })
          )
        }),
        { numRuns }
      )
    })

    test('object({ y: validator(object({ x: number })) })', () => {
      const check = generateCheck(
        ['object', { y: ['validator', ['external', ['identifier', 'check1']]] }],
        ['object', { x: ['number'] }]
      )

      fc.assert(
        fc.property(
          fc.record({ y: fc.record({ x: fc.anything().filter((x) => typeof x !== 'number') }) }),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a number', path: ['y', 'x'] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('transformer(map(number, x => x + 1))', () => {
      const check = generateCheck(
        ['transformer', ['external', ['identifier', 'check1']]],
        ['map', ['number'], ['function', 'x => x + 1']]
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'number'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a number', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('struct({ x: union(external(map(number, x => x + 1)), string) })', () => {
      const check = generateCheck(
        ['struct', { x: ['union', [['external', ['identifier', 'check1']], ['string']]] }],
        ['map', ['number'], ['function', 'x => x + 1']]
      )

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(
          fc.record({
            x: fc.anything().filter((x) => typeof x !== 'number' && typeof x !== 'string'),
            y: fc.boolean()
          }),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [
                  { issue: 'union case #0 mismatch: not a number', path: ['x'] },
                  { issue: 'union case #1 mismatch: not a string', path: ['x'] }
                ]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('lazy', () => {
      const check = generateCheck([
        'lazy',
        [
          'object',
          {
            id: ['string'],
            items: ['array', ['validator', ['external', ['identifier', 'check0']]]]
          }
        ]
      ])

      type Node = {
        readonly id: unknown
        readonly items: readonly unknown[]
      }

      const isNode = (node: unknown): node is Node =>
        typeof node === 'object' && node !== null && 'id' in node && 'items' in node

      const nodeErrors = (node: Node, path: Path = []): readonly Error[] => [
        { issue: 'not a string', path: [...path, 'id'] },
        ...node.items.flatMap((next, idx) =>
          isNode(next) ? nodeErrors(next, [...path, 'items', idx]) : []
        )
      ]

      fc.assert(
        fc.property(
          fc.letrec((tie) => ({
            node: fc.record({
              id: fc.anything().filter((x) => typeof x !== 'string'),
              items: fc.option(fc.array(tie('node')), {
                maxDepth: 2,
                depthIdentifier: 'tree',
                nil: []
              })
            })
          })).node,
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: nodeErrors(val)
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('optional(struct({ x: string }))', () => {
      const check = generateCheck(['optional', ['struct', { x: ['string'] }]])

      fc.assert(
        fc.property(
          fc.anything().filter((x) => typeof x !== 'object' && x !== undefined),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not an object', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )

      fc.assert(
        fc.property(fc.record({}), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'not a string', path: ['x'] }]
            })
          )
        }),
        { numRuns }
      )
    })

    test('object({ x: string, y: struct({ z: boolean }) })', () => {
      const check = generateCheck(['object', { x: ['string'], y: ['struct', { z: ['boolean'] }] }])

      fc.assert(
        fc.property(fc.record({ x: fc.string(), y: fc.record({}) }), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [{ issue: 'not a boolean', path: ['y', 'z'] }]
            })
          )
        }),
        { numRuns }
      )
    })

    test('struct({ x: optional(string) })', () => {
      const check = generateCheck(['struct', { x: ['optional', ['string']] }])

      fc.assert(
        fc.property(
          fc.record({ x: fc.anything().filter((x) => isDefined(x) && typeof x !== 'string') }),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'not a string', path: ['x'] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('template(identifier)', () => {
      const check = generateCheck(['template', [['literal', ['identifier', 'str']]]])

      fc.assert(
        fc.property(
          fc.string().filter((x) => x !== 'STRING'),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [{ issue: 'template literal mismatch', path: [] }]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test('union(limit(number), limit(string))', () => {
      const check = generateCheck([
        'union',
        [
          ['limit', ['number'], ['function', 'x => x > 5']],
          ['limit', ['string'], ['function', 'x => x.length > 5']]
        ]
      ])

      fc.assert(
        fc.property(
          fc.string().filter((x) => x.length < 5),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [
                  { issue: 'union case #0 mismatch: not a number', path: [] },
                  { issue: 'union case #1 mismatch: does not fit the limit', path: [] }
                ]
              })
            )
          }
        ),
        { numRuns }
      )
    })

    test("union(struct({ '': number }), nullish)", () => {
      const check = generateCheck(['union', [['struct', { '': ['number'] }], ['nullish']]])

      fc.assert(
        fc.property(fc.record({}), (val) => {
          expect(check(val)).toEqual(
            Result.failure({
              value: val,
              errors: [
                { issue: 'union case #0 mismatch: not a number', path: [''] },
                { issue: "union case #1 mismatch: not 'null' or 'undefined'", path: [] }
              ]
            })
          )
        }),
        { numRuns }
      )
    })

    test('union(map(number, x => x + 1), map(string, x => x.length))', () => {
      const check = generateCheck([
        'union',
        [
          ['map', ['number'], ['function', 'x => x + 1']],
          ['map', ['string'], ['function', 'x => x.length']],
          ['boolean']
        ]
      ])

      fc.assert(
        fc.property(
          fc
            .anything()
            .filter(
              (x) => typeof x !== 'string' && typeof x !== 'number' && typeof x !== 'boolean'
            ),
          (val) => {
            expect(check(val)).toEqual(
              Result.failure({
                value: val,
                errors: [
                  { issue: 'union case #0 mismatch: not a number', path: [] },
                  { issue: 'union case #1 mismatch: not a string', path: [] },
                  { issue: 'union case #2 mismatch: not a boolean', path: [] }
                ]
              })
            )
          }
        ),
        { numRuns }
      )
    })
  })

  describe('transform - random specs', () => {
    const amount = isCI ? 350 : 100
    const depth = isCI ? 5 : 3

    for (let i = 0; i < amount; i++) {
      test(`random valid spec #${i}`, () => {
        const [spec, arb, convert] = createValidProperty(depth)

        const check = generateCheck(spec)

        fc.assert(
          fc.property(arb, (val) => {
            try {
              expect(check(val)).toEqual(Result.success(convert(val)))
            } catch (e) {
              console.log(`random #${i}`)
              // console.log(String(check))
              console.log(inspect(spec, inspectConfig))
              console.log('checked', inspect(check(val), inspectConfig))
              console.log('unchecked', inspect(val, inspectConfig))
              console.log('converted', inspect(convert(val), inspectConfig))
              // console.log(e)

              throw e
            }
          }),
          { numRuns }
        )
      })
    }

    for (let i = 0; i < amount; i++) {
      test(`random invalid spec #${i}`, () => {
        const [spec, arb, errorArb, elemArbs] = createInvalidProperty(depth)

        const check = generateCheck(spec)

        fc.assert(
          fc.property(arb, errorArb, elemArbs, (val, err, elems) => {
            try {
              const [value, path] = injectError(val, err, elems)
              const errors = err
                .issue(err.error)
                .map((issue) => issue(path))
                .sort(compareObjects)

              const checked = Result.mapError(
                (fail) => ({ ...fail, errors: [...fail.errors].sort(compareObjects) }),
                check(value)
              )

              expect(checked.tag).toEqual('failure')
              if (checked.tag === 'failure') {
                expect(checked.failure.value).toEqual(value)
                const errorSet = new Set(checked.failure.errors.map((x) => JSON.stringify(x)))
                try {
                  expect(errors.every((error) => errorSet.has(JSON.stringify(error)))).toBeTruthy()
                } catch (e) {
                  console.log(
                    inspect(errors, inspectConfig),
                    inspect(checked.failure.errors, inspectConfig)
                  )
                  throw e
                }
              }
              // expect(checked).toEqual(Result.failure({ errors, value }))
            } catch (e) {
              console.log(`random #${i}`)
              console.log(inspect(spec, inspectConfig))
              console.log(inspect(String(check), inspectConfig))
              console.log(inspect(val, inspectConfig))
              // console.log(inspect(value, inspectConfig))
              console.log(inspect(elems, inspectConfig))
              console.log(err.issue(err.error))
              console.log(err.path)
              console.log(err.error)

              // const [v] = injectError(val, err, elems)
              // console.log(inspect(v, inspectConfig))

              throw e
            }
          }),
          { numRuns }
        )
      })
    }
  })
}

createSuite(babelCreateGenerateCheck)

// describe.only('temp', () => {
//   test('temp', () => {
//     console.log(String(generateCheck(['limit', ['number'], ['function', 'x => x >= 0']])))
//     expect(1).toEqual(1)
//   })
// })
