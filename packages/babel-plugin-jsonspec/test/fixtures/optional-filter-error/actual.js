import { optional, number, filter } from 'jsonspec'

const check = optional(filter(number, x => x))
