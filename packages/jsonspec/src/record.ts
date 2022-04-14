import { error } from './util'

type JsonspecRecordKeyError<T extends string> = JsonspecError<T, 'record', ' key'>
type JsonspecRecordItemError<T extends string> = JsonspecError<T, 'record', ' item'>

export const record: {
  /**
   * Creates a record validator spec.
   *
   * @param keySpec Spec to validate each key of a record. Validates a string and can be transformed to string or number
   * @param itemSpec Spec to validate each item of a record.
   */
  <KeySpec extends Spec, ItemSpec extends Spec>(
    keySpec: HasTag<KeySpec, 'optional'> extends true
      ? JsonspecRecordKeyError<'optional'>
      : HasTag<KeySpec, 'unknown'> extends true
      ? JsonspecRecordKeyError<'unknown'>
      : HasTag<KeySpec, 'nullish'> extends true
      ? JsonspecRecordKeyError<'nullish'>
      : HasTag<KeySpec, 'lazy'> extends true
      ? JsonspecRecordKeyError<'lazy'>
      : HasTag<KeySpec, 'array'> extends true
      ? JsonspecRecordKeyError<'array'>
      : HasTag<KeySpec, 'tuple'> extends true
      ? JsonspecRecordKeyError<'tuple'>
      : HasTag<KeySpec, 'object'> extends true
      ? JsonspecRecordKeyError<'object'>
      : HasTag<KeySpec, 'record'> extends true
      ? JsonspecRecordKeyError<'record'>
      : HasTag<KeySpec, 'merge'> extends true
      ? JsonspecRecordKeyError<'merge'>
      : HasTag<KeySpec, 'struct'> extends true
      ? JsonspecRecordKeyError<'struct'>
      : HasTag<KeySpec, 'number'> extends true
      ? JsonspecRecordKeyError<'number'>
      : HasTag<KeySpec, 'boolean'> extends true
      ? JsonspecRecordKeyError<'boolean'>
      : HasTag<KeySpec, 'non-string-literal'> extends true
      ? JsonspecRecordKeyError<'non string literal'>
      : KeySpec extends Spec<readonly string[], string, number | string>
      ? KeySpec
      : { readonly "jsonspec error: only number or string 'record' key types allowed": never },
    itemSpec: HasTag<ItemSpec, 'optional'> extends true
      ? JsonspecRecordItemError<'optional'>
      : ItemSpec
  ): SpecSuccess<KeySpec> extends number | string
    ? Spec<
        ['record'],
        InferKind<readonly [KeySpec, ItemSpec]>,
        { readonly [key in SpecSuccess<KeySpec>]?: SpecSuccess<ItemSpec> }
      >
    : never
  /**
   * Creates a record validation spec. Record keys will not be validated.
   *
   * @param itemSpec Spec to validate each item of a record.
   */
  <ItemSpec extends Spec>(
    itemSpec: HasTag<ItemSpec, 'optional'> extends JsonspecRecordItemError<'optional'>
      ? never
      : ItemSpec
  ): Spec<['record'], SpecKind<ItemSpec>, { readonly [key in string]?: SpecSuccess<ItemSpec> }>
} = error
