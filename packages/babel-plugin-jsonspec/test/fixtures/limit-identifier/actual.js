import { number, limit } from 'jsonspec'
import { inc } from './inc'

const check = limit(number, inc)
