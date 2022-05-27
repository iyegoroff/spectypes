import { HasTag, LiteralBase, SomeSpec, Spec, SpecSuccess, SpectypesError } from './types.js'
import { error } from './error.js'

type Template<Specs extends readonly Spec[]> = Specs extends readonly [infer First, ...infer Rest]
  ? First extends Spec
    ? SpecSuccess<First> extends LiteralBase
      ? Rest extends readonly Spec[]
        ? `${SpecSuccess<First>}${Template<Rest>}`
        : ''
      : ''
    : ''
  : ''

type SpectypesTemplateError<T extends string> = SpectypesError<T, 'template'>

/**
 * Creates a template string validator spec.
 *
 * @param specs Specs to validate parts of the string. Can be only `number`s, `string`s, `boolean`s, `literal`s or their `union`s
 */
export const template: <Specs extends readonly Spec[] = readonly SomeSpec[]>(
  ...specs: Specs & {
    readonly [Index in keyof Specs]: Specs[Index] extends Spec
      ? HasTag<Specs[Index], 'optional'> extends true
        ? SpectypesTemplateError<'optional'>
        : HasTag<Specs[Index], 'filter'> extends true
        ? SpectypesTemplateError<'filter'>
        : HasTag<Specs[Index], 'unknown'> extends true
        ? SpectypesTemplateError<'unknown'>
        : HasTag<Specs[Index], 'nullish'> extends true
        ? SpectypesTemplateError<'nullish'>
        : HasTag<Specs[Index], 'lazy'> extends true
        ? SpectypesTemplateError<'lazy'>
        : HasTag<Specs[Index], 'array'> extends true
        ? SpectypesTemplateError<'array'>
        : HasTag<Specs[Index], 'tuple'> extends true
        ? SpectypesTemplateError<'tuple'>
        : HasTag<Specs[Index], 'merge'> extends true
        ? SpectypesTemplateError<'merge'>
        : HasTag<Specs[Index], 'object'> extends true
        ? SpectypesTemplateError<'object'>
        : HasTag<Specs[Index], 'record'> extends true
        ? SpectypesTemplateError<'record'>
        : HasTag<Specs[Index], 'struct'> extends true
        ? SpectypesTemplateError<'struct'>
        : HasTag<Specs[Index], 'template'> extends true
        ? SpectypesTemplateError<'template'>
        : HasTag<Specs[Index], 'limit'> extends true
        ? SpectypesTemplateError<'limit'>
        : HasTag<Specs[Index], 'map'> extends true
        ? SpectypesTemplateError<'map'>
        : Specs[Index]
      : never
  }
) => Spec<['template'], 'validator', Template<Specs>> = error
