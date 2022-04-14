import { error } from './util'

/**
 * Creates a union validator spec.
 *
 * @param specs Specs to validate union cases
 */
export const union: <Specs extends readonly Spec[]>(
  ...specs: Specs & {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec
      ? HasTag<Specs[Index], 'optional'> extends true
        ? JsonspecError<'optional', 'union'>
        : HasTag<Specs[Index], 'filter'> extends true
        ? JsonspecError<'filter', 'union'>
        : HasTag<Specs[Index], 'unknown'> extends true
        ? JsonspecError<'unknown', 'union'>
        : HasTag<Specs[Index], 'union'> extends true
        ? JsonspecError<'union', 'union'>
        : Specs[Index]
      : never
  }
) => Spec<
  ['union', ...SpecsTags<Specs>],
  InferKind<Specs>,
  {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec ? SpecSuccess<Specs[Index]> : never
  }[number]
> = error
