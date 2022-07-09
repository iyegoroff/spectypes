import { optional, number, object } from 'spectypes'

const check = object({
  x: optional(number)
})
