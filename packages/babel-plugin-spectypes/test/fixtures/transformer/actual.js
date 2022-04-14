import { array, transformer } from 'spectypes'
import { int } from './num'

const check = array(transformer(int))
