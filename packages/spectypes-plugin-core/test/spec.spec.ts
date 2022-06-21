import {
  canAppendElseBlock,
  canBeInlined,
  isMutating,
  isSpecName,
  isTemplateItemArray,
  requiresRuntime
} from '../src'

describe('spec', () => {
  test('isTemplateItem', () => {
    expect(
      isTemplateItemArray([['literal', ['null']], ['number'], ['string'], ['boolean']])
    ).toBeTruthy()

    expect(
      isTemplateItemArray([['nullish'], ['literal', ['null']], ['number'], ['string'], ['boolean']])
    ).toBeFalsy()
  })

  test('isSpecName', () => {
    expect(isSpecName('objectRecord')).toBeTruthy()
    expect(isSpecName('external')).toBeFalsy()
  })

  test('number should be inlined inside union check', () => {
    expect(canBeInlined(['number'])).toBeTruthy()
  })

  test('string should be inlined inside union check', () => {
    expect(canBeInlined(['string'])).toBeTruthy()
  })

  test('boolean should be inlined inside union check', () => {
    expect(canBeInlined(['boolean'])).toBeTruthy()
  })

  test('literal should be inlined inside union check', () => {
    expect(canBeInlined(['literal', ['null']])).toBeTruthy()
  })

  test('template should be inlined inside union check', () => {
    expect(canBeInlined(['template', [['string']]])).toBeTruthy()
  })

  test('validator should be inlined inside union check', () => {
    expect(canBeInlined(['validator', ['external', ['identifier', 'foo']]])).toBeTruthy()
  })

  test('object should not be inlined inside union check', () => {
    expect(canBeInlined(['object', {}])).toBeFalsy()
  })

  test('writable should be inlined if its contents can be inlined inside union check', () => {
    expect(canBeInlined(['writable', ['boolean']])).toBeTruthy()
  })

  test('limit should be inlined if its contents can be inlined inside union check', () => {
    expect(canBeInlined(['limit', ['boolean'], ['identifier', 'foo']])).toBeTruthy()
  })

  test('tuple should be inlined if its contents can be inlined inside union check', () => {
    expect(canBeInlined(['tuple', [['boolean'], ['number']]])).toBeTruthy()
  })

  test('number can be appended with else block', () => {
    expect(canAppendElseBlock(['number'])).toBeTruthy()
  })

  test('object cannot be appended with else block', () => {
    expect(canAppendElseBlock(['object', {}])).toBeFalsy()
  })

  test('template should not be mutating', () => {
    expect(isMutating(['template', []])).toBeFalsy()
  })

  test('number should not be mutating', () => {
    expect(isMutating(['number'])).toBeFalsy()
  })

  test('string should not be mutating', () => {
    expect(isMutating(['string'])).toBeFalsy()
  })

  test('boolean should not be mutating', () => {
    expect(isMutating(['boolean'])).toBeFalsy()
  })

  test('unknown should not be mutating', () => {
    expect(isMutating(['unknown'])).toBeFalsy()
  })

  test('literal should not be mutating', () => {
    expect(isMutating(['literal', ['null']])).toBeFalsy()
  })

  test('nullish should be mutating', () => {
    expect(isMutating(['nullish'])).toBeTruthy()
  })

  test('struct should be mutating', () => {
    expect(isMutating(['struct', {}])).toBeTruthy()
  })

  test('map should be mutating', () => {
    expect(isMutating(['map', ['number'], ['identifier', 'foo']])).toBeTruthy()
  })

  test('optional(number) should not be mutating', () => {
    expect(isMutating(['optional', ['number']])).toBeFalsy()
  })

  test('optional(nullish) should be mutating', () => {
    expect(isMutating(['optional', ['nullish']])).toBeTruthy()
  })

  test('lazy(number) should not be mutating', () => {
    expect(isMutating(['lazy', ['number']])).toBeFalsy()
  })

  test('lazy(nullish) should be mutating', () => {
    expect(isMutating(['lazy', ['nullish']])).toBeTruthy()
  })

  test('array(number) should not be mutating', () => {
    expect(isMutating(['array', ['number']])).toBeFalsy()
  })

  test('array(nullish) should be mutating', () => {
    expect(isMutating(['array', ['nullish']])).toBeTruthy()
  })

  test('limit(number) should not be mutating', () => {
    expect(isMutating(['limit', ['number'], ['identifier', 'foo']])).toBeFalsy()
  })

  test('limit(nullish) should be mutating', () => {
    expect(isMutating(['limit', ['nullish'], ['identifier', 'foo']])).toBeTruthy()
  })

  test('object({ x: number, y: string, z: boolean }) should not be mutating', () => {
    expect(isMutating(['object', { x: ['number'], y: ['string'], z: ['boolean'] }])).toBeFalsy()
  })

  test('object({ x: number, y: nullish, z: boolean }) should be mutating', () => {
    expect(isMutating(['object', { x: ['number'], y: ['nullish'], z: ['boolean'] }])).toBeTruthy()
  })

  test('record(string, number) should not be mutating', () => {
    expect(isMutating(['record', ['string'], ['number']])).toBeFalsy()
  })

  test('record(string, nullish) should be mutating', () => {
    expect(isMutating(['record', ['string'], ['nullish']])).toBeTruthy()
  })

  test('record(map(string, foo), number) should be mutating', () => {
    expect(
      isMutating(['record', ['map', ['string'], ['identifier', 'foo']], ['number']])
    ).toBeTruthy()
  })

  test('tuple(string, number) should not be mutating', () => {
    expect(isMutating(['tuple', [['string'], ['number']]])).toBeFalsy()
  })

  test('tuple(string, nullish) should be mutating', () => {
    expect(isMutating(['tuple', [['string'], ['nullish']]])).toBeTruthy()
  })

  test('union(string, number) should not be mutating', () => {
    expect(isMutating(['union', [['string'], ['number']]])).toBeFalsy()
  })

  test('union(string, nullish) should be mutating', () => {
    expect(isMutating(['union', [['string'], ['nullish']]])).toBeTruthy()
  })

  test('tupleArray([string, number], boolean) should not be mutating', () => {
    expect(isMutating(['tupleArray', [['string'], ['number']], ['boolean']])).toBeFalsy()
  })

  test('tupleArray([string, nullish], boolean) should be mutating', () => {
    expect(isMutating(['tupleArray', [['string'], ['nullish']], ['boolean']])).toBeTruthy()
  })

  test('tupleArray([string, number], nullish) should be mutating', () => {
    expect(isMutating(['tupleArray', [['string'], ['number']], ['nullish']])).toBeTruthy()
  })

  test('objectRecord({ x: number }, string, number) should not be mutating', () => {
    expect(isMutating(['objectRecord', { x: ['number'] }, ['string'], ['number']])).toBeFalsy()
  })

  test('objectRecord({ x: nullish }, string, number) should be mutating', () => {
    expect(isMutating(['objectRecord', { x: ['nullish'] }, ['string'], ['number']])).toBeTruthy()
  })

  test('objectRecord({ x: string }, string, nullish) should be mutating', () => {
    expect(isMutating(['objectRecord', { x: ['string'] }, ['string'], ['nullish']])).toBeTruthy()
  })

  test('objectRecord({ x: boolean }, map(string, foo), number) should be mutating', () => {
    expect(
      isMutating([
        'objectRecord',
        { x: ['boolean'] },
        ['map', ['string'], ['identifier', 'foo']],
        ['number']
      ])
    ).toBeTruthy()
  })

  test('array(foo) should be mutating when foo is wrapped with transformer', () => {
    expect(isMutating(['array', ['transformer', ['external', ['identifier', 'foo']]]])).toBeTruthy()
  })

  test('array(foo) should not be mutating when foo is wrapped with validator', () => {
    expect(isMutating(['array', ['validator', ['external', ['identifier', 'foo']]]])).toBeFalsy()
  })

  test('record should require runtime', () => {
    expect(requiresRuntime('record')).toBeTruthy()
  })

  test('template should require runtime', () => {
    expect(requiresRuntime('template')).toBeTruthy()
  })
})
