import { array, number, filter } from 'spectypes'

const check = array(filter(number, x => x > 1))
