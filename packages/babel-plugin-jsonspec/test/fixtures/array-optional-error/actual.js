import { array, number, optional } from 'jsonspec'

const check = array(optional(number))
