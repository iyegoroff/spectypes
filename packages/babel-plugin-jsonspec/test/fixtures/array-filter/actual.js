import { array, number, filter } from 'jsonspec'

const check = array(filter(number, x => x > 1))
