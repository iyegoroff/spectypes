import { HasTag, SomeSpec, Spec, SpecKind, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates a spec with custom constraint.
 *
 * @param spec Basis spec
 * @param constraint Function that performs additional validation
 */
export const limit: <
  Constraint extends (value: SpecSuccess<ItemSpec>) => boolean,
  ItemSpec extends Spec = SomeSpec
>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'limit'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'limit'>
    : HasTag<ItemSpec, 'lazy'> extends true
    ? SpectypesError<'lazy', 'limit'>
    : ItemSpec,
  constraint: Constraint
) => Spec<
  ['limit', ...SpecTag<ItemSpec>],
  SpecKind<ItemSpec>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Constraint extends (value: any) => value is infer U ? U : SpecSuccess<ItemSpec>
> = error
