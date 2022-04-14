import { optional, number } from 'jsonspec'

const check = optional(optional(number))
