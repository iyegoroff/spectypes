import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { Result } from 'ts-railway'
import { parse as babelParse } from '@babel/parser'
import { types as t } from '@babel/core'
import { parse, parseTemplate } from '../src/parse'
import { Spec, SpecName } from '../src/spec'
import { isDefined } from 'ts-is-defined'

const readFile = promisify(fs.readFile)

const names = [
  'boolean',
  'number',
  'string',
  'nullish',
  'unknown',
  'literal',
  'optional',
  'array',
  'tuple',
  'union',
  'object',
  'struct',
  'record',
  'tupleArray',
  'objectRecord',
  'lazy',
  'template',
  'map',
  'limit',
  'writable',
  'validator',
  'transformer',
  'merge',
  'filter',
  'UNSAFE_record',
  'UNSAFE_objectRecord'
] as const

const specNames = names.reduce<Record<string, SpecName>>((map, name) => {
  map[name] = name
  return map
}, {})

const fixturesDir = path.join(__dirname, 'fixtures')

const genericFixtureTest = (fixture: string, check: (actual: Result<Spec, string>) => void) => {
  test(`should parse ${fixture}`, async () => {
    const actualPath = path.join(fixturesDir, fixture, 'actual.js')
    const code = (await readFile(actualPath, {})).toString()
    const { body } = babelParse(code, { sourceType: 'module' }).program
    const lastNode = body[body.length - 1]

    if (
      !t.isVariableDeclaration(lastNode) ||
      !isDefined(lastNode.declarations[0]) ||
      !isDefined(lastNode.declarations[0].init)
    ) {
      throw new Error(`Invalid fixture - ${fixture}/actual.js`)
    }

    check(parse(lastNode.declarations[0].init, { specNames }))
  })
}

const fixtureTest = (fixture: string, expected: Result<Spec, string>) =>
  genericFixtureTest(fixture, (actual) => {
    expect(actual).toEqual(expected)
  })

const fixtureSuccessTest = (fixture: string, expected: Spec) =>
  fixtureTest(fixture, Result.success(expected))

const fixtureFailureTest = (fixture: string, expected: string) =>
  fixtureTest(fixture, Result.failure(`spectypes error: ${expected}`))

const astTest = (name: string, expression: t.Expression, expected: Result<Spec, string>) =>
  test(`should parse ${name}`, () => expect(parse(expression, { specNames })).toEqual(expected))

const astFailureTest = (name: string, expression: t.Expression, expected: string) =>
  astTest(name, expression, Result.failure(expected))

describe('parse', () => {
  fixtureSuccessTest('boolean', ['boolean'])

  fixtureSuccessTest('number', ['number'])

  fixtureSuccessTest('nullish', ['nullish'])

  fixtureSuccessTest('string', ['string'])

  fixtureSuccessTest('unknown', ['unknown'])

  fixtureSuccessTest('optional', ['object', { x: ['optional', ['number']] }])

  fixtureSuccessTest('array-filter', ['array', ['number'], ['function', 'x => x > 1']])

  fixtureSuccessTest('array', ['array', ['number']])

  fixtureSuccessTest('validator', ['array', ['validator', ['external', ['identifier', 'int']]]])

  fixtureSuccessTest('transformer', ['array', ['transformer', ['external', ['identifier', 'int']]]])

  fixtureSuccessTest('tuple', ['tuple', [['number'], ['string'], ['boolean']]])

  fixtureSuccessTest('union', ['union', [['number'], ['string'], ['boolean']]])

  fixtureSuccessTest('record-filter', [
    'record',
    ['string'],
    ['boolean'],
    ['function', 'x => x.length > 5'],
    ['function', 'x => x']
  ])

  fixtureSuccessTest('record-filter-without-key', [
    'record',
    ['string'],
    ['boolean'],
    undefined,
    ['function', 'x => x']
  ])

  fixtureSuccessTest('record-filter-value', [
    'record',
    ['string'],
    ['boolean'],
    undefined,
    ['function', 'x => x']
  ])

  fixtureSuccessTest('record-filter-key', [
    'record',
    ['string'],
    ['boolean'],
    ['function', 'x => x.length > 5']
  ])

  fixtureSuccessTest('object', ['object', { x: ['number'], y: ['string'], z: ['boolean'] }])

  fixtureSuccessTest('writable', [
    'writable',
    ['object', { x: ['number'], y: ['string'], z: ['boolean'] }]
  ])

  fixtureSuccessTest('struct', ['struct', { x: ['number'], y: ['string'], z: ['boolean'] }])

  fixtureSuccessTest('record', ['record', ['string'], ['boolean']])

  fixtureSuccessTest('record-external-key', [
    'record',
    ['external', ['identifier', 'Key']],
    ['string']
  ])

  fixtureSuccessTest('record-external-value', [
    'record',
    ['string'],
    ['external', ['identifier', 'Key']]
  ])

  fixtureSuccessTest('record-external-key-value', [
    'record',
    ['external', ['identifier', 'Key']],
    ['external', ['identifier', 'Value']]
  ])

  fixtureSuccessTest('unsafe-record', ['UNSAFE_record', ['string'], ['boolean']])

  fixtureSuccessTest('record-without-key', ['record', ['string'], ['boolean']])

  fixtureSuccessTest('merge-record', [
    'objectRecord',
    { x: ['number'] },
    ['string'],
    ['boolean'],
    undefined,
    undefined
  ])

  fixtureSuccessTest('merge-unsafe-record', [
    'UNSAFE_objectRecord',
    { x: ['number'] },
    ['string'],
    ['boolean'],
    undefined,
    undefined
  ])

  fixtureSuccessTest('merge-record-key-filter', [
    'objectRecord',
    { x: ['number'] },
    ['string'],
    ['boolean'],
    ['function', 'x => x.length > 5'],
    undefined
  ])

  fixtureSuccessTest('merge-record-value-filter', [
    'objectRecord',
    { x: ['number'] },
    ['string'],
    ['boolean'],
    undefined,
    ['function', 'x => x']
  ])

  fixtureSuccessTest('merge-record-filter', [
    'objectRecord',
    { x: ['number'] },
    ['string'],
    ['boolean'],
    ['function', 'x => x.length > 5'],
    ['function', 'x => x']
  ])

  fixtureSuccessTest('record-mapped-union-key', [
    'record',
    [
      'union',
      [
        ['literal', ['string', 'a']],
        ['map', ['literal', ['string', 'b']], ['function', "() => 'c'"]]
      ]
    ],
    ['boolean']
  ])

  fixtureSuccessTest('literal-boolean', ['literal', ['boolean', true]])

  fixtureSuccessTest('literal-number', ['literal', ['numeric', 1]])

  fixtureSuccessTest('literal-string', ['literal', ['string', 'test']])

  fixtureSuccessTest('literal-undefined', ['literal', ['identifier', 'undefined']])

  fixtureSuccessTest('literal-null', ['literal', ['null']])

  fixtureSuccessTest('template', [
    'template',
    [['literal', ['string', 'test']], ['string'], ['number'], ['boolean']]
  ])

  fixtureSuccessTest('template-union', [
    'template',
    [
      ['literal', ['string', 'test']],
      ['union', [['literal', ['string', 'foo']], ['number'], ['literal', ['numeric', 123]]]],
      ['boolean']
    ]
  ])

  fixtureSuccessTest('merge-array', [
    'tupleArray',
    [['string'], ['string']],
    ['boolean'],
    undefined
  ])

  fixtureSuccessTest('merge-array-filter', [
    'tupleArray',
    [['string'], ['string']],
    ['boolean'],
    ['function', 'x => x']
  ])

  fixtureSuccessTest('lazy', [
    'lazy',
    [
      'object',
      { name: ['string'], likes: ['array', ['validator', ['external', ['identifier', 'person']]]] }
    ]
  ])

  fixtureSuccessTest('map-identifier', ['map', ['number'], ['identifier', 'inc']])

  fixtureSuccessTest('limit-identifier', ['limit', ['number'], ['identifier', 'inc']])

  fixtureSuccessTest('limit', ['limit', ['number'], ['function', 'x => x > 1']])

  fixtureSuccessTest('map', ['map', ['number'], ['function', 'x => x + 1']])

  fixtureFailureTest(
    'unknown-construct-error',
    'unknown construct starts at ln:3 col:15, ends at ln:3 col:34'
  )

  fixtureFailureTest(
    'invalid-call-expression-error',
    "call expression 'number' that starts at ln:3 col:15, ends at ln:3 col:23 should be an identifier"
  )

  fixtureFailureTest(
    'invalid-identifier-error',
    "identifier 'array' that starts at ln:3 col:15, ends at ln:3 col:20 should be a call expression"
  )

  fixtureFailureTest(
    'merge-invalid-arguments-error',
    "'merge' spec that starts at ln:3 col:15, ends at ln:3 col:63 should contain 'tuple' & 'array' or 'object' & 'record' specs"
  )

  fixtureFailureTest(
    'merge-invalid-first-argument-error',
    "first argument of the 'merge' spec that starts at ln:3 col:15, ends at ln:3 col:56 should be an expression"
  )

  fixtureFailureTest(
    'merge-invalid-second-argument-error',
    "second argument of the 'merge' spec that starts at ln:3 col:15, ends at ln:3 col:56 should be an expression"
  )

  fixtureFailureTest(
    'lazy-argument-error',
    "first argument of the 'lazy' spec that starts at ln:3 col:15, ends at ln:3 col:67 should be an arrow function"
  )

  fixtureFailureTest(
    'lazy-argument-body-error',
    "the body of the 'lazy' spec first argument that starts at ln:3 col:20, ends at ln:3 col:57 should be just a single expression"
  )

  fixtureFailureTest(
    'record-error',
    "first argument of the 'record' spec that starts at ln:3 col:15, ends at ln:3 col:23 should be an expression"
  )

  fixtureFailureTest(
    'validator-error',
    "'optional', 'validator' or 'transformer' should be used only inside inside another spec starts at ln:4 col:15, ends at ln:4 col:29"
  )

  fixtureFailureTest(
    'transformer-error',
    "'optional', 'validator' or 'transformer' should be used only inside inside another spec starts at ln:4 col:15, ends at ln:4 col:31"
  )

  fixtureFailureTest(
    'literal-error',
    "first argument the 'literal' spec that starts at ln:3 col:15, ends at ln:3 col:34 should be a string literal, a null literal, a numeric literal, a boolean literal or an identifier"
  )

  fixtureFailureTest(
    'struct-first-argument-error',
    "first argument of the 'struct' spec that starts at ln:3 col:15, ends at ln:3 col:29 should be an object expression"
  )

  fixtureFailureTest(
    'struct-first-argument-property-error',
    "the 'struct' spec first argument property that starts at ln:3 col:24, ends at ln:3 col:33 should be an object property"
  )

  fixtureFailureTest(
    'struct-first-argument-property-key-error',
    "the 'struct' spec first argument property key that starts at ln:3 col:25, ends at ln:3 col:28 should be an identifier"
  )

  fixtureFailureTest(
    'template-argument-error',
    "the 'template' spec argument #0 that starts at ln:3 col:24, ends at ln:3 col:34 should be an expression"
  )

  fixtureFailureTest(
    'tuple-error',
    "the 'tuple' spec argument #0 that starts at ln:3 col:21, ends at ln:3 col:30 should be an expression"
  )

  fixtureFailureTest(
    'limit-first-argument-error',
    "first argument of the 'limit' spec that starts at ln:3 col:15, ends at ln:3 col:43 should be an expression"
  )

  fixtureFailureTest(
    'limit-second-argument-error',
    "second argument of the 'limit' spec that starts at ln:3 col:15, ends at ln:3 col:62 should be an identifier or an arrow function"
  )

  fixtureFailureTest(
    'array-error',
    "first argument of the 'array' spec that starts at ln:3 col:15, ends at ln:3 col:31 should be an expression"
  )

  fixtureFailureTest(
    'writable-error',
    "first argument of the 'writable' spec that starts at ln:3 col:15, ends at ln:3 col:72 should be an expression"
  )

  fixtureFailureTest('array-optional-error', "'optional' can't appear directly inside 'array'")

  fixtureFailureTest(
    'record-optional-value-error',
    "'optional' can't appear directly inside 'record' item"
  )

  fixtureFailureTest('template-union-error', "'tuple' can't appear directly inside 'union'")

  fixtureFailureTest(
    'record-without-key-optional-value-error',
    "'optional' can't appear directly inside 'record' item"
  )

  fixtureFailureTest('template-tuple-error', "'tuple' can't appear directly inside 'template'")

  fixtureFailureTest('record-key-error', "'array' can't appear directly inside 'record' key")

  fixtureFailureTest('lazy-filter-error', "'filter' can't appear directly inside 'lazy'")

  fixtureFailureTest('map-filter-error', "'filter' can't appear directly inside 'map'")

  fixtureFailureTest('map-optional-error', "'optional' can't appear directly inside 'map'")

  fixtureFailureTest('map-filter-error', "'filter' can't appear directly inside 'map'")

  fixtureFailureTest('struct-filter-error', "'filter' can't appear directly inside 'struct'")

  fixtureFailureTest('optional-nested-error', "'optional' can't appear directly inside 'optional'")

  fixtureFailureTest('optional-filter-error', "'filter' can't appear directly inside 'optional'")

  fixtureFailureTest(
    'optional-standalone-error',
    "'optional', 'validator' or 'transformer' should be used only inside inside another spec starts at ln:3 col:15, ends at ln:3 col:31"
  )

  fixtureFailureTest(
    'filter-standalone-error',
    "call expression 'filter' that starts at ln:3 col:15, ends at ln:3 col:41 should be an identifier"
  )

  fixtureFailureTest('tuple-optional-error', "'optional' can't appear directly inside 'tuple'")

  fixtureFailureTest('union-unknown-error', "'unknown' can't appear directly inside 'union'")

  fixtureFailureTest('union-nested-error', "'union' can't appear directly inside 'union'")

  astFailureTest(
    'struct-first-argument-property-value-error',
    t.callExpression(t.identifier('struct'), [
      t.objectExpression([t.objectProperty(t.identifier('a'), t.objectPattern([]))])
    ]),
    "spectypes error: the 'struct' spec first argument property value that starts at ln:NaN col:NaN, ends at ln:NaN col:NaN should be an expression"
  )

  test('parseTemplate failure', () => {
    expect(
      parseTemplate(t.callExpression(t.identifier('template'), [t.identifier('nullish')]), [], {
        specNames
      })
    ).toEqual({
      failure:
        "spectypes error: the 'template' spec that starts at ln:NaN col:NaN, ends at ln:NaN col:NaN has unsupported arguments",
      tag: 'failure'
    })
  })
})
