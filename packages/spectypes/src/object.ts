import { error } from './util'

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
export const object: <Specs extends Record<string, Spec>>(
  specs: Specs & {
    readonly [Key in keyof Specs]: Specs[Key] extends Spec
      ? HasTag<Specs[Key], 'filter'> extends true
        ? SpectypesError<'filter', 'object'>
        : Specs[Key]
      : never
  }
) => Spec<['object'], InferKindObject<Specs>, ObjectValue<Specs>> = error
