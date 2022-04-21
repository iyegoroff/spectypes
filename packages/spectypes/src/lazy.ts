import { HasTag, SomeSpec, Spec, SpecKind, SpecSuccess, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates a spec to validate a value with recursive type.
 * Doesn't support data that recursively references itself.
 *
 * @param spec Function that returns a spec
 */
export const lazy: <ItemSpec extends Spec = SomeSpec>(
  spec: HasTag<ItemSpec, 'filter'> extends true ? SpectypesError<'filter', 'lazy'> : () => ItemSpec
) => Spec<['lazy'], SpecKind<ItemSpec>, SpecSuccess<ItemSpec>> = error

export type LazySpec<ItemSpec extends Spec> = Spec<
  ['lazy'],
  SpecKind<ItemSpec>,
  SpecSuccess<ItemSpec>
>
