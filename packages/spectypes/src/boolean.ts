import { Spec } from './types'
import { error } from './error'

/** Boolean validator spec. */
export const boolean: Spec<['boolean'], 'validator', boolean> = error
