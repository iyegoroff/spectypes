import { HasTag, SomeSpec, Spec, SpecKind, SpecSuccess, SpectypesError } from './types.js'
import { error } from './error.js'

/**
 * Creates a spec to validate a value with recursive type.
 * Doesn't support data that recursively references itself.
 *
 * @param spec Function that returns a spec
 */
export const lazy: <ItemSpec extends Spec = SomeSpec>(
  spec: HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'lazy'>
    : HasTag<ItemSpec, 'lazy'> extends true
    ? SpectypesError<'lazy', 'lazy'>
    : () => ItemSpec
) => Spec<['lazy'], SpecKind<ItemSpec>, SpecSuccess<ItemSpec>> = error

type LazySpec<Item, Kind extends 'validator' | 'transformer'> = Spec<['lazy'], Kind, Item>

export type LazyValidatorSpec<Item> = LazySpec<Item, 'validator'>

export type LazyTransformerSpec<Item> = LazySpec<Item, 'transformer'>
