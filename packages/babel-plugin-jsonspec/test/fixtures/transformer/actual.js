import { array, transformer } from 'jsonspec'
import { int } from './num'

const check = array(transformer(int))
