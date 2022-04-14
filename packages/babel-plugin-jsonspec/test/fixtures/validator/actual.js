import { array, validator } from 'jsonspec'
import { int } from './num'

const check = array(validator(int))
