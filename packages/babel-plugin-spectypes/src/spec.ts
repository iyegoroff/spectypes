import { isDefined } from 'ts-is-defined'

export type Identifier = readonly ['identifier', string]
export type ArrowFunction = readonly ['function', string]

export type LiteralSpec = readonly [
  'literal',
  (
    | Identifier
    | readonly ['string', string]
    | readonly ['numeric', number]
    | readonly ['null']
    | readonly ['boolean', boolean]
  )
]
export type OptionalSpec = readonly ['optional', Spec]
export type NumberSpec = readonly ['number']
export type StringSpec = readonly ['string']
export type BooleanSpec = readonly ['boolean']
export type TemplateItemArray = ReadonlyArray<
  LiteralSpec | NumberSpec | StringSpec | BooleanSpec | UnionSpec
>
export type TemplateSpec = readonly ['template', TemplateItemArray]
export type UnknownSpec = readonly ['unknown']
export type NullishSpec = readonly ['nullish']
export type LazySpec = readonly ['lazy', Spec]
export type TupleSpec = readonly ['tuple', readonly Spec[]]
export type UnionSpec = readonly ['union', readonly Spec[]]
export type ArraySpec = readonly ['array', Spec, (Identifier | ArrowFunction)?]
export type ObjectSpec = readonly ['object', Record<string, Spec>]
export type StructSpec = readonly ['struct', Record<string, Spec>]
export type RecordSpec = readonly [
  'record',
  Spec,
  Spec,
  (Identifier | ArrowFunction)?,
  (Identifier | ArrowFunction)?
]
export type LimitSpec = readonly ['limit', Spec, Identifier | ArrowFunction]
export type MapSpec = readonly ['map', Spec, Identifier | ArrowFunction]
export type FilterSpec = readonly ['filter', Spec, Identifier | ArrowFunction]
export type TupleArraySpec = readonly [
  'tupleArray',
  readonly Spec[],
  Spec,
  (Identifier | ArrowFunction)?
]
export type ObjectRecordSpec = readonly [
  'objectRecord',
  Record<string, Spec>,
  Spec,
  Spec,
  (Identifier | ArrowFunction)?,
  (Identifier | ArrowFunction)?
]
export type ExternalSpec = readonly ['external', Identifier]
export type WritableSpec = readonly ['writable', Spec]
export type ValidatorSpec = readonly ['validator', Spec]
export type TransformerSpec = readonly ['transformer', Spec]

export type Spec =
  | NumberSpec
  | StringSpec
  | BooleanSpec
  | UnknownSpec
  | NullishSpec
  | OptionalSpec
  | LiteralSpec
  | LazySpec
  | TupleSpec
  | UnionSpec
  | ArraySpec
  | ObjectSpec
  | StructSpec
  | RecordSpec
  | TemplateSpec
  | LimitSpec
  | MapSpec
  | TupleArraySpec
  | ObjectRecordSpec
  | ExternalSpec
  | WritableSpec
  | ValidatorSpec
  | TransformerSpec

export type SpecName = Spec[0] | 'merge' | 'filter'

export const isTemplateItem = (spec: Spec): spec is TemplateItemArray[number] =>
  spec[0] === 'literal' ||
  spec[0] === 'number' ||
  spec[0] === 'string' ||
  spec[0] === 'boolean' ||
  spec[0] === 'union'

export const isTemplateItemArray = (specs: readonly Spec[]): specs is TemplateItemArray =>
  specs.every(isTemplateItem)

export const isSpecName = (name: string): name is Spec[0] =>
  name === 'number' ||
  name === 'string' ||
  name === 'boolean' ||
  name === 'unknown' ||
  name === 'nullish' ||
  name === 'literal' ||
  name === 'optional' ||
  name === 'lazy' ||
  name === 'tuple' ||
  name === 'union' ||
  name === 'array' ||
  name === 'object' ||
  name === 'struct' ||
  name === 'record' ||
  name === 'template' ||
  name === 'limit' ||
  name === 'map' ||
  name === 'tupleArray' ||
  name === 'objectRecord' ||
  name === 'writable' ||
  name === 'validator' ||
  name === 'transformer' ||
  name === 'merge' ||
  name === 'filter'

export const isMutating = (spec: Spec): boolean => {
  switch (spec[0]) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'unknown':
    case 'literal':
    case 'template':
    case 'validator':
      return false

    case 'nullish':
    case 'struct':
    case 'map':
    case 'transformer':
    case 'external':
      return true

    case 'optional':
    case 'lazy':
    case 'limit':
    case 'writable':
      return isMutating(spec[1])

    case 'array':
      return isMutating(spec[1]) || isDefined(spec[2])

    case 'object':
      return Object.values(spec[1]).some(isMutating)

    case 'record':
      return isMutating(spec[1]) || isMutating(spec[2]) || isDefined(spec[3]) || isDefined(spec[4])

    case 'tuple':
    case 'union':
      return spec[1].some(isMutating)

    case 'tupleArray':
      return spec[1].some(isMutating) || isMutating(spec[2]) || isDefined(spec[3])

    case 'objectRecord':
      return (
        Object.values(spec[1]).some(isMutating) ||
        isMutating(spec[2]) ||
        isMutating(spec[3]) ||
        isDefined(spec[4]) ||
        isDefined(spec[5])
      )
  }
}
