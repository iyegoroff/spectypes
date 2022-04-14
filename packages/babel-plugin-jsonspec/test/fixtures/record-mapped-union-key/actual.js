import { record, string, boolean, union, literal, map } from 'jsonspec'

const check = record(union(literal('a'), map(literal('b'), () => 'c')), boolean)
