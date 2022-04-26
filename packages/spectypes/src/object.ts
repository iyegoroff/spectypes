import { HasTag, ObjectValue, SomeSpec, Spec, SpecKind, SpectypesError } from './types'
import { error } from './error'

type InferKindObject<Specs extends Record<string, Spec>> = 'transformer' extends {
  readonly [Key in keyof Specs]: Specs[Key] extends Spec ? SpecKind<Specs[Key]> : never
}[keyof Specs]
  ? 'transformer'
  : 'validator'

/**
 * Creates an object validator spec.
 * Validation will fail if validated object has a property set different from the one specified
 * by `specs` param.
 *
 * @param specs Specs to validate object properties
 */
export const object: <Specs extends Record<string, Spec> = Record<string, SomeSpec>>(
  specs: Specs & {
    readonly [Key in keyof Specs]: Specs[Key] extends Spec
      ? HasTag<Specs[Key], 'filter'> extends true
        ? SpectypesError<'filter', 'object'>
        : HasTag<Specs[Key], 'lazy'> extends true
        ? SpectypesError<'lazy', 'object'>
        : Specs[Key]
      : never
  }
) => Spec<['object'], InferKindObject<Specs>, ObjectValue<Specs>> = error
