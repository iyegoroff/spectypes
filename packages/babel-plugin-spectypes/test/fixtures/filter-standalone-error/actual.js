import { number, filter } from 'spectypes'

const check = filter(number, x => x > 1)
