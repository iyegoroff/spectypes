import { HasTag, ObjectValue, SomeSpec, Spec, SpectypesError } from './types'
import { error } from './error'
/**
 * Creates an object transformer spec.
 * All properties of validated object that are not present in `specs` param will be removed from
 * the result of successful validation.
 *
 * @param specs Specs to validate object properties
 */
export const struct: <Specs extends Record<string, Spec> = Record<string, SomeSpec>>(
  specs: Specs & {
    readonly [Key in keyof Specs]: Specs[Key] extends Spec
      ? HasTag<Specs[Key], 'filter'> extends true
        ? SpectypesError<'filter', 'struct'>
        : HasTag<Specs[Key], 'lazy'> extends true
        ? SpectypesError<'lazy', 'struct'>
        : Specs[Key]
      : never
  }
) => Spec<['struct'], 'transformer', ObjectValue<Specs>> = error
