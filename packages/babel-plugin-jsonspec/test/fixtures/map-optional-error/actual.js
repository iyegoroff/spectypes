import { number, map, optional } from 'jsonspec'

const check = map(optional(number), x => x + 1)
