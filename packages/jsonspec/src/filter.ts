import { error } from './util'

/**
 * Can be used only as an argument for `array` and `record` to create filtered transformer specs.
 * Filtering happens after each item or key validation.
 *
 * @param spec Spec to validate each item or key of a collection
 * @param transform Filter predicate
 */
export const filter: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? JsonspecError<'optional', 'filter'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? JsonspecError<'filter', 'filter'>
    : ItemSpec,
  transform: (form: SpecSuccess<ItemSpec>) => boolean
) => Spec<['filter', ...SpecTag<ItemSpec>], 'transformer', SpecSuccess<ItemSpec>> = error
