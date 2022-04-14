import { number, map } from 'jsonspec'

const check = map(number, x => x + 1)
