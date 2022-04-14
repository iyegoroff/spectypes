import { error } from './util'

export const merge: {
  /**
   * Creates a combined tuple & array validator spec.
   *
   * @param tuple Tuple spec
   * @param array Array spec
   */
  <TupleSpec extends Spec<['tuple']>, ArraySpec extends Spec<['array']>>(
    tuple: TupleSpec,
    array: ArraySpec
  ): Spec<
    ['tuple-array'],
    InferKind<readonly [TupleSpec, ArraySpec]>,
    SpecSuccess<TupleSpec> extends readonly unknown[]
      ? SpecSuccess<ArraySpec> extends readonly unknown[]
        ? readonly [...SpecSuccess<TupleSpec>, ...SpecSuccess<ArraySpec>]
        : never
      : never
  >
  /**
   * Creates a combined object & record validator spec.
   *
   * @param object Object spec
   * @param record Record spec
   */
  <ObjectSpec extends Spec<['object']>, RecordSpec extends Spec<['record']>>(
    object: ObjectSpec,
    record: RecordSpec
  ): Spec<
    ['object-record'],
    InferKind<readonly [ObjectSpec, RecordSpec]>,
    PrettyType<SpecSuccess<ObjectSpec> & SpecSuccess<RecordSpec>>
  >
} = error
