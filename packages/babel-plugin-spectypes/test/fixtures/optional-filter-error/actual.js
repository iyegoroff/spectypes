import { optional, number, filter } from 'spectypes'

const check = optional(filter(number, x => x))
