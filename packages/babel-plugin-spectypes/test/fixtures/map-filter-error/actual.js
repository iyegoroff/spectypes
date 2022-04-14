import { number, map, filter } from 'spectypes'

const check = map(filter(number, x => x > 1), x => x + 1)
