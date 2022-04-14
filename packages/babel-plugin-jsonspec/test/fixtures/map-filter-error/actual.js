import { number, map, filter } from 'jsonspec'

const check = map(filter(number, x => x > 1), x => x + 1)
