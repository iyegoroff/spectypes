import { number, limit } from 'spectypes'

const check = limit(number, x => x > 1)
