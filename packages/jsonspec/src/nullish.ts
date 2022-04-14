import { error } from './util'

/** Transformer spec, that accepts `undefined` and `null` values and maps them to `undefined`. */
export const nullish: Spec<['nullish'], 'transformer', undefined> = error
