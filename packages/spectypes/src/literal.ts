import { LiteralBase, Spec } from './types'
import { error } from './util'

/**
 * Creates a literal validator spec. When `literal(undefined)` is used as a property validator
 * inside `object` or `struct` and that property is not present in the validated object
 * the validation will fail.
 *
 * @param value Literal value: constant string, number, boolean, null or undefined value
 */
export const literal: <Literal extends LiteralBase>(
  value: Literal
) => Spec<
  [Literal extends string ? 'string-literal' : 'non-string-literal'],
  'validator',
  Literal
> = error
