import { Spec } from './types'
import { error } from './util'

/** Boolean validator spec. */
export const boolean: Spec<['boolean'], 'validator', boolean> = error
