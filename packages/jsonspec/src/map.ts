import { error } from './util'

/**
 * Creates a spec that transforms the result of successful validation.
 *
 * @param spec Basis spec
 * @param transform Success mapping function
 */
export const map: <ItemSpec extends Spec, To>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? JsonspecError<'optional', 'map'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? JsonspecError<'filter', 'map'>
    : ItemSpec,
  transform: (form: SpecSuccess<ItemSpec>) => To
) => Spec<['map', ...SpecTag<ItemSpec>], 'transformer', To> = error
