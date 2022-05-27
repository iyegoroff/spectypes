import { Spec } from './types.js'
import { error } from './error.js'

/** String validator spec. */
export const string: Spec<['string'], 'validator', string> = error
