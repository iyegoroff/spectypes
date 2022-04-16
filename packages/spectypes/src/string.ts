import { Spec } from './types'
import { error } from './error'

/** String validator spec. */
export const string: Spec<['string'], 'validator', string> = error
