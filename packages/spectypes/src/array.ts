import { HasTag, Spec, SpecKind, SpecSuccess, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates an array validator spec.
 *
 * @param spec Spec to validate each item of an array
 */
export const array: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'optional'> extends true ? SpectypesError<'optional', 'array'> : ItemSpec
) => Spec<['array'], SpecKind<ItemSpec>, ReadonlyArray<SpecSuccess<ItemSpec>>> = error
