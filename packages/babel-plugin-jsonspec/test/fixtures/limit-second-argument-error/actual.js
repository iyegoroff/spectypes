import { number, limit } from 'jsonspec'

const check = limit(number, function foo(x) { return x > 1 })
