import { record, string, boolean, union, literal, map } from 'spectypes'

const check = record(union(literal('a'), map(literal('b'), () => 'c')), boolean)
