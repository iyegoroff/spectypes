import { error } from './util'

/**
 * Creates an optional object property validator spec. Can be used only inside 'object' and 'struct'
 * arguments. Will not produce any validation errors if property equals undefined or is not present
 * in the validated object.
 *
 * @param spec Non-optional spec
 */
export const optional: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'optional'> extends true
    ? SpectypesError<'optional', 'optional'>
    : HasTag<ItemSpec, 'filter'> extends true
    ? SpectypesError<'filter', 'optional'>
    : ItemSpec
) => Spec<
  ['optional', ...SpecTag<ItemSpec>],
  SpecKind<ItemSpec>,
  SpecSuccess<ItemSpec> | undefined
> = error
