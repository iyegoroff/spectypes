import { HasTag, PrettyType, Spec, SpecKind, SpecSuccess, SpecTag, SpectypesError } from './types'
import { error } from './util'

// source: https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier/43001581#43001581
type DeepWritable<T> = PrettyType<{ -readonly [P in keyof T]: DeepWritable<T[P]> }>

/** Creates an empty validator that removes `readonly` modifiers from the result of validation */
export const writable: <ItemSpec extends Spec>(
  spec: HasTag<ItemSpec, 'filter'> extends true ? SpectypesError<'filter', 'writable'> : ItemSpec
) => Spec<SpecTag<ItemSpec>, SpecKind<ItemSpec>, DeepWritable<SpecSuccess<ItemSpec>>> = error
