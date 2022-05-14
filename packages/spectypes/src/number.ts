import { Spec } from './types'
import { error } from './error'

/** Number validator spec. */
export const number: Spec<['number'], 'validator', number> = error
