import { HasTag, SomeSpec, Spec, SpecKind, SpecSuccess, SpectypesError } from './types.js'
import { error } from './error.js'

/**
 * Creates an array validator spec.
 *
 * @param spec Spec to validate each item of an array
 */
export const array: <ItemSpec extends Spec = SomeSpec>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'array'>
    : HasTag<ItemSpec, 'lazy'> extends true
    ? SpectypesError<'lazy', 'array'>
    : ItemSpec
) => Spec<['array'], SpecKind<ItemSpec>, ReadonlyArray<SpecSuccess<ItemSpec>>> = error
