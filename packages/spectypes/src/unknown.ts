import { Spec } from './types'
import { error } from './error'

/**
 * Empty validator spec. When `unknown` is used as a property validator
 * inside `object` or `struct` and that property is not present in the validated object
 * the validation will fail.
 */
export const unknown: Spec<['unknown'], 'validator'> = error
