import { HasTag, InferKind, SomeSpec, Spec, SpecSuccess, SpectypesError } from './types'
import { error } from './error'

/**
 * Creates a tuple validator spec.
 *
 * @param specs Specs to validate tuple parts
 */
export const tuple: <Specs extends readonly Spec[] = readonly SomeSpec[]>(
  ...specs: Specs & {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec
      ? HasTag<Specs[Index], 'optional'> extends true
        ? SpectypesError<'optional', 'tuple'>
        : HasTag<Specs[Index], 'filter'> extends true
        ? SpectypesError<'filter', 'tuple'>
        : HasTag<Specs[Index], 'lazy'> extends true
        ? SpectypesError<'lazy', 'tuple'>
        : Specs[Index]
      : never
  }
) => Spec<
  ['tuple'],
  InferKind<Specs>,
  { readonly [Index in keyof Specs]: Specs[Index] extends Spec ? SpecSuccess<Specs[Index]> : never }
> = error
