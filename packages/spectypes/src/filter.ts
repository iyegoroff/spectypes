import { HasTag, SomeSpec, Spec, SpecSuccess, SpecTag, SpectypesError } from './types.js'
import { error } from './error.js'

/**
 * Can be used only as an argument for `array` and `record` to create filtered transformer specs.
 * Filtering happens after each item or key validation.
 *
 * @param spec Spec to validate each item or key of a collection
 * @param predicate Filter predicate
 */
export const filter: <
  Predicate extends (value: SpecSuccess<ItemSpec>) => boolean,
  ItemSpec extends Spec = SomeSpec
>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'filter'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'filter'>
    : HasTag<ItemSpec, 'lazy'> extends true
    ? SpectypesError<'lazy', 'filter'>
    : ItemSpec,
  predicate: Predicate
) => Spec<
  ['filter', ...SpecTag<ItemSpec>],
  'transformer',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Predicate extends (value: any) => value is infer U ? U : SpecSuccess<ItemSpec>
> = error
