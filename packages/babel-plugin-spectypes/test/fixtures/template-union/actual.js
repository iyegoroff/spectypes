import { template, literal, number, string, boolean, union } from 'spectypes'

const check = template(literal('test'), union(literal('foo'), number, literal(123)), boolean)
