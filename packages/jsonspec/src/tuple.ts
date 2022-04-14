import { error } from './util'

/**
 * Creates a tuple validator spec.
 *
 * @param specs Specs to validate tuple parts
 */
export const tuple: <Specs extends readonly Spec[]>(
  ...specs: Specs & {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec
      ? HasTag<Specs[Index], 'optional'> extends true
        ? JsonspecError<'optional', 'tuple'>
        : HasTag<Specs[Index], 'filter'> extends true
        ? JsonspecError<'filter', 'tuple'>
        : Specs[Index]
      : never
  }
) => Spec<
  ['tuple'],
  InferKind<Specs>,
  { readonly [Index in keyof Specs]: Specs[Index] extends Spec ? SpecSuccess<Specs[Index]> : never }
> = error
