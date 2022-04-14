import { number, limit } from 'spectypes'
import { inc } from './inc'

const check = limit(number, inc)
