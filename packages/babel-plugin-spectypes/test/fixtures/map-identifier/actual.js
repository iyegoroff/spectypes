import { number, map } from 'spectypes'
import { inc } from './inc'

const check = map(number, inc)
