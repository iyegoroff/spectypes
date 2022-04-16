import { HasTag, Spec, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates a spec that transforms the result of successful validation.
 *
 * @param spec Basis spec
 * @param transform Success mapping function
 */
export const map: <ItemSpec extends Spec, To>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'map'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'map'>
    : ItemSpec,
  transform: (form: SpecSuccess<ItemSpec>) => To
) => Spec<['map', ...SpecTag<ItemSpec>], 'transformer', To> = error
