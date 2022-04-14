import { number, map } from 'jsonspec'
import { inc } from './inc'

const check = map(number, inc)
