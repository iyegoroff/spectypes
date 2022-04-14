import { number, limit } from 'jsonspec'

const check = limit(number, x => x > 1)
