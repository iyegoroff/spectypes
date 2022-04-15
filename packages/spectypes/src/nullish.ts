import { Spec } from './types'
import { error } from './util'

/**
 * Transformer spec, that accepts `undefined` and `null` values and maps them to `undefined`.
 * When `nullish` is used as a property validator inside `object` or `struct` and that property
 * is not present in the validated object the result will still contain that property.
 * */
export const nullish: Spec<['nullish'], 'transformer', undefined> = error
