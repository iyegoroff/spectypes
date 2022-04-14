import { number, map, optional } from 'spectypes'

const check = map(optional(number), x => x + 1)
