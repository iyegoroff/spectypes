import { Spec } from './types.js'
import { error } from './error.js'

/** Boolean validator spec. */
export const boolean: Spec<['boolean'], 'validator', boolean> = error
