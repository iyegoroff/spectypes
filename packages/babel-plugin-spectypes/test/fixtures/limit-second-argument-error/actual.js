import { number, limit } from 'spectypes'

const check = limit(number, function foo(x) { return x > 1 })
