import { array, validator } from 'spectypes'
import { int } from './num'

const check = array(validator(int))
