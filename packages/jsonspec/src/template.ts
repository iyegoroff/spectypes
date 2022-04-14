import { error } from './util'

type Template<Specs extends readonly Spec[]> = Specs extends readonly [infer First, ...infer Rest]
  ? First extends Spec
    ? SpecSuccess<First> extends LiteralBase
      ? Rest extends readonly Spec[]
        ? `${SpecSuccess<First>}${Template<Rest>}`
        : ''
      : ''
    : ''
  : ''

type JsonspecTemplateError<T extends string> = JsonspecError<T, 'template'>

/**
 * Creates a template string validator spec.
 *
 * @param specs Specs to validate parts of the string. Can be only `number`s, `string`s, `boolean`s, `literal`s or their `union`s
 */
export const template: <Specs extends readonly Spec[]>(
  ...specs: Specs & {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec
      ? HasTag<Specs[Index], 'optional'> extends true
        ? JsonspecTemplateError<'optional'>
        : HasTag<Specs[Index], 'filter'> extends true
        ? JsonspecTemplateError<'filter'>
        : HasTag<Specs[Index], 'unknown'> extends true
        ? JsonspecTemplateError<'unknown'>
        : HasTag<Specs[Index], 'nullish'> extends true
        ? JsonspecTemplateError<'nullish'>
        : HasTag<Specs[Index], 'lazy'> extends true
        ? JsonspecTemplateError<'lazy'>
        : HasTag<Specs[Index], 'array'> extends true
        ? JsonspecTemplateError<'array'>
        : HasTag<Specs[Index], 'tuple'> extends true
        ? JsonspecTemplateError<'tuple'>
        : HasTag<Specs[Index], 'merge'> extends true
        ? JsonspecTemplateError<'merge'>
        : HasTag<Specs[Index], 'object'> extends true
        ? JsonspecTemplateError<'object'>
        : HasTag<Specs[Index], 'record'> extends true
        ? JsonspecTemplateError<'record'>
        : HasTag<Specs[Index], 'struct'> extends true
        ? JsonspecTemplateError<'struct'>
        : HasTag<Specs[Index], 'template'> extends true
        ? JsonspecTemplateError<'template'>
        : HasTag<Specs[Index], 'limit'> extends true
        ? JsonspecTemplateError<'limit'>
        : HasTag<Specs[Index], 'map'> extends true
        ? JsonspecTemplateError<'map'>
        : Specs[Index]
      : never
  }
) => Spec<['template'], 'validator', Template<Specs>> = error
