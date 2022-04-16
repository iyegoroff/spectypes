import { HasTag, Spec, SpecKind, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates a spec with custom constraint.
 *
 * @param spec Basis spec
 * @param constraint Function that performs additional validation
 */
export const limit: <
  ItemSpec extends Spec,
  Constraint extends (value: SpecSuccess<ItemSpec>) => boolean
>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'limit'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'limit'>
    : ItemSpec,
  constraint: Constraint
) => Spec<
  ['limit', ...SpecTag<ItemSpec>],
  SpecKind<ItemSpec>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Constraint extends (value: any) => value is infer U ? U : SpecSuccess<ItemSpec>
> = error
