import { template, literal, number, string, boolean } from 'jsonspec'

const check = template(literal('test'), string, number, boolean)
