import { HasTag, Spec, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './util'

/**
 * Spec that tells babel plugin to generate a wrapper for an external validator spec.
 *
 * @param spec An external validator spec
 */
export const validator: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'validator'>
    : ItemSpec extends Spec<readonly string[], 'transformer', unknown>
    ? { readonly "spectypes error: transformer can't be wrapped with 'validator'": never }
    : ItemSpec
) => Spec<SpecTag<ItemSpec>, 'validator', SpecSuccess<ItemSpec>> = error
