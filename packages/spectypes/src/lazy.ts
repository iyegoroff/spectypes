import { error } from './util'

/**
 * Creates a spec to validate a value with recursive type.
 * Doesn't support data that recursively references itself.
 *
 * @param spec Function that returns a spec
 */
export const lazy: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'filter'> extends true ? SpectypesError<'filter', 'lazy'> : () => ItemSpec
) => Spec<['lazy'], SpecKind<ItemSpec>, SpecSuccess<ItemSpec>> = error
