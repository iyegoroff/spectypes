import { HasTag, Spec, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './error'

/**
 * Spec that tells babel plugin to generate a wrapper for an external transformer spec.
 *
 * @param spec An external transformer spec
 */
export const transformer: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'transformer'>
    : ItemSpec extends Spec<readonly string[], 'validator', unknown>
    ? { readonly "spectypes error: validator can't be wrapped with 'transformer'": never }
    : ItemSpec
) => Spec<SpecTag<ItemSpec>, 'transformer', SpecSuccess<ItemSpec>> = error
