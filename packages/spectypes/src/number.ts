import { Spec } from './types.js'
import { error } from './error.js'

/** Number validator spec. */
export const number: Spec<['number'], 'validator', number> = error
