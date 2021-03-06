import {
  HasTag,
  InferKind,
  SomeSpec,
  Spec,
  SpecKind,
  SpecSuccess,
  SpectypesError
} from './types.js'
import { error } from './error.js'

type SpectypesRecordKeyError<T extends string> = SpectypesError<T, 'record', ' key'>
type SpectypesRecordItemError<T extends string> = SpectypesError<T, 'record', ' item'>

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UNSAFE_record: {
  /**
   * Creates a record validator spec. Unlike `record` this validator is not protected from prototype
   * pollution and objects containing properties that override Object.prototype methods are valid.
   *
   * @param keySpec Spec to validate each key of a record. Validates a string and can be transformed to string or number
   * @param itemSpec Spec to validate each item of a record.
   */
  <KeySpec extends Spec = SomeSpec, ItemSpec extends Spec = SomeSpec>(
    keySpec: HasTag<KeySpec, 'optional'> extends true
      ? SpectypesRecordKeyError<'optional'>
      : HasTag<KeySpec, 'unknown'> extends true
      ? SpectypesRecordKeyError<'unknown'>
      : HasTag<KeySpec, 'nullish'> extends true
      ? SpectypesRecordKeyError<'nullish'>
      : HasTag<KeySpec, 'lazy'> extends true
      ? SpectypesRecordKeyError<'lazy'>
      : HasTag<KeySpec, 'array'> extends true
      ? SpectypesRecordKeyError<'array'>
      : HasTag<KeySpec, 'tuple'> extends true
      ? SpectypesRecordKeyError<'tuple'>
      : HasTag<KeySpec, 'object'> extends true
      ? SpectypesRecordKeyError<'object'>
      : HasTag<KeySpec, 'record'> extends true
      ? SpectypesRecordKeyError<'record'>
      : HasTag<KeySpec, 'merge'> extends true
      ? SpectypesRecordKeyError<'merge'>
      : HasTag<KeySpec, 'struct'> extends true
      ? SpectypesRecordKeyError<'struct'>
      : HasTag<KeySpec, 'number'> extends true
      ? SpectypesRecordKeyError<'number'>
      : HasTag<KeySpec, 'boolean'> extends true
      ? SpectypesRecordKeyError<'boolean'>
      : HasTag<KeySpec, 'non-string-literal'> extends true
      ? SpectypesRecordKeyError<'non string literal'>
      : KeySpec extends Spec<readonly string[], string, number | string>
      ? KeySpec
      : { readonly "spectypes error: only number or string 'record' key types allowed": never },
    itemSpec: HasTag<ItemSpec, 'optional'> extends true
      ? SpectypesRecordItemError<'optional'>
      : HasTag<ItemSpec, 'lazy'> extends true
      ? SpectypesRecordItemError<'lazy'>
      : ItemSpec
  ): SpecSuccess<KeySpec> extends number | string
    ? Spec<
        ['record'],
        InferKind<readonly [KeySpec, ItemSpec]>,
        { readonly [key in SpecSuccess<KeySpec>]: SpecSuccess<ItemSpec> }
      >
    : never
  /**
   * Creates a record validation spec. Record keys will not be validated. Unlike `record` this
   * validator is not protected from prototype pollution and objects containing properties that
   * override Object.prototype methods are valid.
   *
   * @param itemSpec Spec to validate each item of a record.
   */
  <ItemSpec extends Spec = SomeSpec>(
    itemSpec: HasTag<ItemSpec, 'optional'> extends true
      ? SpectypesRecordItemError<'optional'>
      : HasTag<ItemSpec, 'lazy'> extends true
      ? SpectypesRecordItemError<'lazy'>
      : ItemSpec
  ): Spec<['record'], SpecKind<ItemSpec>, { readonly [key in string]: SpecSuccess<ItemSpec> }>
} = error
